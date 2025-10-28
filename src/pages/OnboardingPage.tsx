import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const email = searchParams.get('email');

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Atualizar senha do usuário
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      toast.success("Senha definida com sucesso! Bem-vindo ao Drive Mental 🎉");
      navigate('/dashboard');
    } catch (error: any) {
      console.error('[ONBOARDING] Error setting password:', error);
      toast.error(error.message || "Erro ao definir senha");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Crie Sua Senha</CardTitle>
              <CardDescription>
                Seu pagamento foi confirmado! Agora defina sua senha para acessar a plataforma.
                {email && <span className="block mt-2 text-sm">Email: <strong>{email}</strong></span>}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirme a Senha</Label>
                  <Input 
                    id="confirmPassword"
                    type="password" 
                    placeholder="Digite a senha novamente" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Definindo senha...
                    </>
                  ) : (
                    'Definir Senha e Acessar'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
