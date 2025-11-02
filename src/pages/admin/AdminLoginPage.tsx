
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { useAdminAuthentication } from "@/hooks/useAdminAuthentication";

/**
 * AdminLoginPage - Página de login administrativa
 * Responsabilidade: Interface para login de administradores (princípio SRP)
 * Princípio KISS: Interface limpa focada no essencial
 */
export default function AdminLoginPage() {
  const [email, setEmail] = useState("dppsoft@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, error, loginAdmin, clearError } = useAdminAuthentication();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('AdminLoginPage: Formulário de login submetido');
    
    clearError();
    
    const { success } = await loginAdmin({ email, password });
    
    if (success) {
      console.log('AdminLoginPage: Redirecionando para:', from);
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Acesso Administrativo</CardTitle>
            <p className="text-muted-foreground mt-2">
              Entre com suas credenciais para acessar o painel
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@drivemeental.com"
                required
                disabled={isLoading}
                className="bg-background/50 h-12 text-base"
                spellCheck="false"
                autoCapitalize="none"
                autoCorrect="off"
                data-form-type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="bg-background/50 pr-10 h-12 text-base"
                  spellCheck="false"
                  autoCapitalize="none"
                  autoCorrect="off"
                  data-form-type="password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/forgot-password')}
                className="h-auto p-0 text-sm text-muted-foreground hover:text-primary"
              >
                Esqueci minha senha
              </Button>
            </div>

            <Button
              type="submit"
              variant="premium"
              size="lg"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar no Painel"}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}
