
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings } from 'lucide-react';

export const AdminPricingPage: React.FC = () => {
  const navigate = useNavigate();

  // Redirecionar automaticamente para a nova página
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/admin/subscription-plans');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Settings className="h-5 w-5" />
              Página Atualizada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-orange-700">
              O sistema de preços foi atualizado para suportar múltiplos planos de assinatura 
              com sistema de promoções avançado.
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Novas Funcionalidades:</h4>
              <ul className="list-disc pl-5 space-y-1 text-orange-700 text-sm">
                <li>Gerenciamento de múltiplos planos (Trimestral, Semestral, Anual)</li>
                <li>Sistema de promoções por plano individual</li>
                <li>Configuração de benefícios globais</li>
                <li>Preview em tempo real das alterações</li>
                <li>Integração automática com o sistema de checkout</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/admin/subscription-plans')}
                className="flex items-center gap-2"
              >
                Ir para Nova Página
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/admin')}
              >
                Voltar ao Dashboard
              </Button>
            </div>
            
            <p className="text-xs text-orange-600">
              Você será redirecionado automaticamente em alguns segundos...
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
