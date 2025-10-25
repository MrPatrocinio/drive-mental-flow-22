
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";
import { UserLoginForm } from "@/components/UserLoginForm";
import { useUser } from "@/contexts/UserContext";

/**
 * UserLoginPage - Página de login/cadastro para usuários regulares
 * Responsabilidade: Layout da página com tabs para login e cadastro (princípio SRP)
 * Princípio KISS: Interface limpa e focada no essencial
 */
export default function UserLoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [prefilledEmail, setPrefilledEmail] = useState("");
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const redirectParam = params.get('redirect');
    const planParam = params.get('plan');
    
    if (emailParam) {
      setPrefilledEmail(emailParam);
      setActiveTab("signup");
    }
    
    if (redirectParam) {
      setRedirectTo(redirectParam);
    }
    
    if (planParam) {
      setPlanId(planParam);
    }
  }, []);

  // Redirecionar usuário autenticado de volta ao fluxo de assinatura
  useEffect(() => {
    if (isAuthenticated && redirectTo) {
      const url = planId ? `${redirectTo}?auto_plan=${planId}` : redirectTo;
      console.log('[USER_LOGIN] Usuário autenticado, redirecionando para:', url);
      navigate(url);
    }
  }, [isAuthenticated, redirectTo, planId, navigate]);

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {activeTab === "login" ? "Entrar" : "Criar Conta"}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {planId 
                ? `Você está a um passo de assinar! ${activeTab === "login" ? "Entre" : "Crie sua conta"} para continuar.`
                : activeTab === "login" 
                  ? "Faça login para acessar sua conta" 
                  : "Crie sua conta para começar"}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <UserLoginForm mode="login" initialEmail={prefilledEmail} />
            </TabsContent>
            
            <TabsContent value="signup">
              <UserLoginForm mode="signup" initialEmail={prefilledEmail} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
