
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { UserLoginForm } from "@/components/UserLoginForm";

/**
 * UserLoginPage - Página de login para usuários regulares
 * Responsabilidade: Layout da página de login (princípio SRP)
 * Princípio KISS: Interface limpa e focada no essencial
 */
export default function UserLoginPage() {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
            <p className="text-muted-foreground mt-2">
              Faça login para acessar sua conta
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <UserLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
