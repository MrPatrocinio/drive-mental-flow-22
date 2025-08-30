
/**
 * UserLoginForm - Componente de formulário de login para usuários
 * Responsabilidade: Apenas UI do formulário de login (princípio SRP)
 * Princípio SoC: Separação entre apresentação e lógica
 */

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useUserAuthentication } from "@/hooks/useUserAuthentication";
import type { LoginCredentials } from "@/services/supabase/authService";
import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * Componente focado apenas na UI do formulário
 * Princípio KISS: Interface simples e intuitiva
 */
export const UserLoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, login, clearError } = useUserAuthentication();
  const { trackEvent } = useAnalytics();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Tracking analytics: tentativa de login
    trackEvent('login_attempt', { email });

    const credentials: LoginCredentials = { email, password };
    const { success } = await login(credentials);
    
    if (success) {
      // Tracking analytics: login bem-sucedido
      trackEvent('login_success', { email });
      navigate(from, { replace: true });
    } else {
      // Tracking analytics: falha no login
      trackEvent('login_failure', { email });
    }
  };

  return (
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
          placeholder="seu@email.com"
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

      <Button
        type="submit"
        variant="premium"
        size="lg"
        className="w-full h-12 text-base"
        disabled={isLoading}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};
