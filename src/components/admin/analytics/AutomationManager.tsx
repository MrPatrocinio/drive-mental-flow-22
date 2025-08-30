import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { AutomationRule, AutomationStats } from "@/services/automationService";
import { Play, Pause, TestTube, Zap, Mail, Clock, Target } from "lucide-react";

export interface AutomationManagerProps {
  automations: AutomationRule[];
  stats: AutomationStats | null;
  loading?: boolean;
  triggering?: string | null;
  onToggle: (automationId: string, isActive: boolean) => Promise<boolean>;
  onTrigger: (automationId: string, userEmail?: string) => Promise<boolean>;
}

/**
 * Gerenciador de automações de marketing
 * Responsabilidade: Interface para configurar e monitorar automações
 */
export const AutomationManager = ({ 
  automations, 
  stats, 
  loading, 
  triggering,
  onToggle, 
  onTrigger 
}: AutomationManagerProps) => {
  const [testEmail, setTestEmail] = useState("");

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automações de Marketing
            </CardTitle>
            <CardDescription>Carregando automações...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'user_signup': return '👋';
      case 'subscription_expired': return '💳';
      case 'inactive_user': return '😴';
      case 'trial_ending': return '⏰';
      default: return '📧';
    }
  };

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case 'user_signup': return 'bg-blue-100 text-blue-800';
      case 'subscription_expired': return 'bg-red-100 text-red-800';
      case 'inactive_user': return 'bg-yellow-100 text-yellow-800';
      case 'trial_ending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggle = async (automationId: string, isActive: boolean) => {
    await onToggle(automationId, isActive);
  };

  const handleTrigger = async (automationId: string) => {
    await onTrigger(automationId, testEmail || undefined);
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas das Automações */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalAutomations}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.activeAutomations}</div>
                  <div className="text-sm text-muted-foreground">Ativas</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalTriggers}</div>
                  <div className="text-sm text-muted-foreground">Execuções</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Taxa Sucesso</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Automações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automações de Marketing
          </CardTitle>
          <CardDescription>
            Configure automações baseadas no comportamento dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {automations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma automação configurada
            </div>
          ) : (
            <div className="space-y-4">
              {automations.map((automation) => (
                <div 
                  key={automation.id} 
                  className={`border rounded-lg p-4 ${
                    automation.isActive ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">
                          {getTriggerIcon(automation.trigger)}
                        </div>
                        <div>
                          <h4 className="font-medium">{automation.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {automation.condition}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getTriggerColor(automation.trigger)}>
                          {automation.trigger.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          <Mail className="h-3 w-3 mr-1" />
                          {automation.action}
                        </Badge>
                        {automation.emailTemplate && (
                          <Badge variant="secondary">
                            Template: {automation.emailTemplate}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {automation.triggerCount} execuções
                        </div>
                        {automation.lastTriggered && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Última: {new Date(automation.lastTriggered).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={automation.isActive}
                        onCheckedChange={(checked) => handleToggle(automation.id, checked)}
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrigger(automation.id)}
                        disabled={!automation.isActive || triggering === automation.id}
                      >
                        <TestTube className="h-3 w-3 mr-1" />
                        {triggering === automation.id ? 'Testando...' : 'Teste'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração de Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Teste de Automações</CardTitle>
          <CardDescription>
            Configure um email para receber os testes das automações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="seu-email@exemplo.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              type="email"
            />
            <Button 
              variant="outline"
              onClick={() => setTestEmail("")}
              disabled={!testEmail}
            >
              Limpar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Se não informar email, será usado um email padrão para teste
          </p>
        </CardContent>
      </Card>
    </div>
  );
};