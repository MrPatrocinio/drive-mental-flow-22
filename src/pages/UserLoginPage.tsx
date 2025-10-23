
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";
import { UserLoginForm } from "@/components/UserLoginForm";

/**
 * UserLoginPage - Página de login/cadastro para usuários regulares
 * Responsabilidade: Layout da página com tabs para login e cadastro (princípio SRP)
 * Princípio KISS: Interface limpa e focada no essencial
 */
export default function UserLoginPage() {
  const [activeTab, setActiveTab] = useState("login");

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
              {activeTab === "login" 
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
              <UserLoginForm mode="login" />
            </TabsContent>
            
            <TabsContent value="signup">
              <UserLoginForm mode="signup" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
