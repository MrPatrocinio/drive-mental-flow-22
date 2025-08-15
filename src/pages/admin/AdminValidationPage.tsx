import { AdminLayout } from "@/components/admin/AdminLayout";
import { SystemValidationPanel } from "@/components/admin/SystemValidationPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle,
  Settings,
  Database,
  Route,
  Smartphone
} from "lucide-react";

export const AdminValidationPage = () => {
  const validationCategories = [
    {
      title: "Integridade de Dados",
      icon: Database,
      description: "Validação de campos, áudios e relacionamentos",
      status: "active"
    },
    {
      title: "Estrutura de Rotas",
      icon: Route,
      description: "Verificação de todas as rotas administrativas e de usuário",
      status: "active"
    },
    {
      title: "Funcionamento dos Serviços",
      icon: Settings,
      description: "Teste de ContentService, StatsService e sincronização",
      status: "active"
    },
    {
      title: "Responsividade",
      icon: Smartphone,
      description: "Validação de breakpoints e elementos críticos",
      status: "active"
    }
  ];

  return (
    <AdminLayout title="Validação do Sistema">
      <div className="space-y-6">
        {/* Introdução */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Etapa 5: Validação e Testes Completos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Esta página executa uma validação completa do sistema, verificando:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validationCategories.map((category, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <category.icon className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{category.title}</span>
                      <Badge variant="default" className="text-xs">
                        Ativo
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Painel de Validação */}
        <SystemValidationPanel />

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Arquitetura e Princípios Aplicados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">SRP</h4>
                <p className="text-muted-foreground">
                  ValidationService com responsabilidade única de validação
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">DRY</h4>
                <p className="text-muted-foreground">
                  Componentes reutilizáveis e lógica centralizada
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">SSOT</h4>
                <p className="text-muted-foreground">
                  Fonte única de verdade para validações e dados
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">KISS</h4>
                <p className="text-muted-foreground">
                  Interface simples e direta para validação
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">YAGNI</h4>
                <p className="text-muted-foreground">
                  Apenas validações essenciais implementadas
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Fail Fast</h4>
                <p className="text-muted-foreground">
                  Detecção precoce de erros e inconsistências
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};