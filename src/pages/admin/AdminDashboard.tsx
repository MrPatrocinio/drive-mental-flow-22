import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import { 
  FileText, 
  Music, 
  Users, 
  DollarSign, 
  Eye,
  Plus,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { fields, audios, landingContent } = useAdmin();
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total de Campos",
      value: fields.length,
      icon: Users,
      color: "text-blue-500",
      change: "+0 este mês"
    },
    {
      title: "Total de Áudios", 
      value: audios.length,
      icon: Music,
      color: "text-green-500",
      change: "+0 este mês"
    },
    {
      title: "Preço Atual",
      value: `${landingContent.pricing.currency} ${landingContent.pricing.price}`,
      icon: DollarSign,
      color: "text-yellow-500",
      change: "Sem alterações"
    },
    {
      title: "Funcionalidades",
      value: landingContent.features.length,
      icon: BarChart3,
      color: "text-purple-500",
      change: "+0 este mês"
    }
  ];

  const quickActions = [
    {
      title: "Editar Landing Page",
      description: "Modifique o conteúdo da página inicial",
      icon: FileText,
      action: () => navigate("/admin/landing"),
      color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
    },
    {
      title: "Gerenciar Campos",
      description: "Adicione ou edite campos de desenvolvimento",
      icon: Users,
      action: () => navigate("/admin/fields"),
      color: "bg-green-500/10 hover:bg-green-500/20 border-green-500/20"
    },
    {
      title: "Adicionar Áudio",
      description: "Faça upload de novos áudios",
      icon: Plus,
      action: () => navigate("/admin/audios"),
      color: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20"
    },
    {
      title: "Visualizar Site",
      description: "Veja como está o site público",
      icon: Eye,
      action: () => window.open("/", "_blank"),
      color: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20"
    }
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo ao Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie todo o conteúdo do Drive Mental a partir daqui
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-muted-foreground">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer smooth-transition hover-lift border ${action.color}`}
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center">
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Sistema inicializado",
                  time: "Agora",
                  description: "Painel administrativo configurado com sucesso"
                },
                {
                  action: "Dados carregados",
                  time: "Agora",
                  description: `${fields.length} campos e ${audios.length} áudios disponíveis`
                },
                {
                  action: "Conteúdo sincronizado",
                  time: "Agora", 
                  description: "Landing page atualizada com as informações mais recentes"
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background/30">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{activity.action}</h4>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}