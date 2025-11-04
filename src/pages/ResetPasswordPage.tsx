import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ResetPasswordService } from "@/services/resetPasswordService";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [success, setSuccess] = useState(false);

  // PKCE idempotente: processa ?code= OU verifica sessão existente
  useEffect(() => {
    const processToken = async () => {
      console.log('[RESET PASSWORD] URL:', window.location.href);

      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      // 1) Veio com ?code= (PKCE) → troca o código por sessão AQUI
      if (code) {
        console.log('[RESET] Processing PKCE code');
        setIsLoading(true);
        
        try {
          const { error } = await ResetPasswordService.exchangeCodeForSession(code);
          
          if (error) {
            toast({
              title: "Link inválido",
              description: error,
              variant: "destructive"
            });
            
            setTimeout(() => {
              navigate("/forgot-password");
            }, 2000);
            return;
          }
          
          console.log('[RESET] Session established via PKCE');
          setHasToken(true);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // 2) Sem ?code= → verifica se já existe sessão (ex.: usuário clicou 2x no link)
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('[RESET] Session already present', { userId: session.user.id });
        setHasToken(true);
        return;
      }

      // 3) Nem code nem session → link inválido
      console.warn('[RESET] No code and no session');
      toast({
        title: "Link expirado",
        description: "O link de recuperação é inválido ou expirou. Solicite um novo.",
        variant: "destructive"
      });
      
      setTimeout(() => {
        navigate("/forgot-password");
      }, 2000);
    };

    processToken();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await ResetPasswordService.updatePassword(newPassword);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao redefinir senha",
          description: error,
        });
      } else {
        setSuccess(true);
        toast({
          title: "Senha redefinida com sucesso!",
          description: "Você já pode fazer login com sua nova senha.",
        });

        // Redireciona para login após 3 segundos
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Se não tem token, não renderiza o formulário
  if (!hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Se já teve sucesso, mostra mensagem de confirmação
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Senha Redefinida!</h2>
            <p className="text-muted-foreground">
              Sua senha foi atualizada com sucesso. Você será redirecionado para a página de login em instantes...
            </p>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full mt-4"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="space-y-2 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Nova Senha
          </CardTitle>
          <CardDescription className="text-base">
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botão de Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Atualizando...
                </>
              ) : (
                "Redefinir Senha"
              )}
            </Button>

            {/* Link de Volta */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/forgot-password")}
                disabled={isLoading}
                className="text-muted-foreground hover:text-primary"
              >
                Solicitar novo link de recuperação
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
