
/**
 * UserLoginForm - Componente de formulário de login/cadastro para usuários
 * Responsabilidade: Apenas UI do formulário (princípio SRP)
 * Princípio SoC: Separação entre apresentação e lógica
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useUserAuthentication } from "@/hooks/useUserAuthentication";
import type { LoginCredentials, SignUpCredentials } from "@/services/supabase/authService";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSubscription } from "@/hooks/useSubscription";

interface UserLoginFormProps {
  mode: "login" | "signup";
  initialEmail?: string;
}

/**
 * Componente focado apenas na UI do formulário
 * Princípio KISS: Interface simples e intuitiva
 */
export const UserLoginForm: React.FC<UserLoginFormProps> = ({ mode, initialEmail = "" }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, login, signUp, clearError } = useUserAuthentication();
  const { trackEvent } = useAnalytics();
  const { checkSubscription } = useSubscription();

  // Update email when initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Extrai parâmetros da URL
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || "/dashboard";
  const pendingPlan = searchParams.get('plan');

  const from = location.state?.from?.pathname || redirectPath;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === "login") {
      // Tracking analytics: tentativa de login
      trackEvent('login_attempt', { email });

      const credentials: LoginCredentials = { email, password };
      const { success } = await login(credentials);
      
      if (success) {
        // Tracking analytics: login bem-sucedido
        trackEvent('login_success', { email });
        
        // Check for pending subscription after successful login/signup
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get('session_id');
        
        // If there's a session_id, process pending subscription
        if (sessionId) {
          console.log('[USER-LOGIN] Processing pending subscription for session:', sessionId);
          try {
            // Verificar se existe assinatura pendente e associá-la
            const { data: pendingData } = await supabase
              .from('pending_subscriptions')
              .select('*')
              .eq('email', email)
              .maybeSingle();

            if (pendingData) {
              console.log('[USER-LOGIN] Found pending subscription, associating with user');
              
              // Atualizar subscriber com dados da assinatura pendente
              const { error: updateError } = await supabase
                .from('subscribers')
                .update({
                  stripe_customer_id: pendingData.stripe_customer_id,
                  stripe_subscription_id: pendingData.stripe_subscription_id,
                  subscription_status: 'active',
                  subscribed: true,
                  subscription_tier: pendingData.subscription_tier
                })
                .eq('email', email);

              if (!updateError) {
                // Deletar da tabela de pendentes
                await supabase
                  .from('pending_subscriptions')
                  .delete()
                  .eq('id', pendingData.id);
                
                console.log('[USER-LOGIN] Pending subscription successfully associated');
              }
            }
          } catch (error) {
            console.error('[USER-LOGIN] Error processing pending subscription:', error);
          }
        }
        
        const redirect = searchParams.get('redirect') || '/dashboard';
        await checkSubscription();
        navigate(redirect);
      } else {
        // Tracking analytics: falha no login
        trackEvent('login_failure', { email });
      }
    } else {
      // Tracking analytics: tentativa de cadastro
      trackEvent('signup_attempt', { email });

      const credentials: SignUpCredentials = { 
        email, 
        password,
        display_name: displayName || email.split('@')[0]
      };
      const { success } = await signUp(credentials);
      
      if (success) {
        // Tracking analytics: cadastro bem-sucedido
        trackEvent('signup_success', { email });
        
        // Check for pending subscription after successful signup
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get('session_id');
        
        // If there's a session_id, process pending subscription
        if (sessionId) {
          console.log('[USER-SIGNUP] Processing pending subscription for session:', sessionId);
          try {
            // Verificar se existe assinatura pendente e associá-la
            const { data: pendingData } = await supabase
              .from('pending_subscriptions')
              .select('*')
              .eq('email', email)
              .maybeSingle();

            if (pendingData) {
              console.log('[USER-SIGNUP] Found pending subscription, associating with user');
              
              // Atualizar subscriber com dados da assinatura pendente
              const { error: updateError } = await supabase
                .from('subscribers')
                .update({
                  stripe_customer_id: pendingData.stripe_customer_id,
                  stripe_subscription_id: pendingData.stripe_subscription_id,
                  subscription_status: 'active',
                  subscribed: true,
                  subscription_tier: pendingData.subscription_tier
                })
                .eq('email', email);

              if (!updateError) {
                // Deletar da tabela de pendentes
                await supabase
                  .from('pending_subscriptions')
                  .delete()
                  .eq('id', pendingData.id);
                
                console.log('[USER-SIGNUP] Pending subscription successfully associated');
              }
            }
          } catch (error) {
            console.error('[USER-SIGNUP] Error processing pending subscription:', error);
          }
        }
        
        const redirect = searchParams.get('redirect') || '/dashboard';
        await checkSubscription();
        navigate(redirect);
      } else {
        // Tracking analytics: falha no cadastro
        trackEvent('signup_failure', { email });
      }
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

      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="displayName">Nome (opcional)</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Seu nome"
            disabled={isLoading}
            className="bg-background/50 h-12 text-base"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete={mode === "signup" ? "email" : "username"}
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
        {isLoading 
          ? (mode === "login" ? "Entrando..." : "Criando conta...") 
          : (mode === "login" ? "Entrar" : "Criar conta")}
      </Button>
    </form>
  );
};
