import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { useAutomations } from "@/hooks/useAutomations";
import { useFeedback } from "@/hooks/useFeedback";
import { ConversionFunnelChart } from "@/components/admin/analytics/ConversionFunnelChart";
import { AutomationManager } from "@/components/admin/analytics/AutomationManager";
import { FeedbackCollector } from "@/components/admin/analytics/FeedbackCollector";
import { RefreshCw, BarChart3, Zap, MessageSquare, Users } from "lucide-react";

/**
 * Página de analytics avançados e automações
 * Responsabilidade: Coordenação da interface de analytics/automações avançadas
 */
export default function AdminAnalyticsAdvancedPage() {
  const {
    conversionFunnel,
    behaviorMetrics,
    advancedMetrics,
    userSegmentation,
    loading: analyticsLoading,
    error: analyticsError,
    refreshAllData: refreshAnalytics,
  } = useAdvancedAnalytics();

  const {
    automations,
    stats: automationStats,
    loading: automationsLoading,
    error: automationsError,
    triggering,
    refreshAllData: refreshAutomations,
    toggleAutomation,
    triggerAutomation,
  } = useAutomations();

  const {
    feedbacks,
    npsMetrics,
    feedbackStats,
    loading: feedbackLoading,
    error: feedbackError,
    refreshAllData: refreshFeedback,
    updateFeedbackStatus,
    deleteFeedback,
  } = useFeedback();

  const handleRefreshAll = async () => {
    await Promise.all([
      refreshAnalytics(),
      refreshAutomations(),
      refreshFeedback(),
    ]);
  };

  const hasError = analyticsError || automationsError || feedbackError;
  const isLoading = analyticsLoading || automationsLoading || feedbackLoading;

  if (hasError) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics Avançados</h1>
              <p className="text-muted-foreground">
                Erro ao carregar dados de analytics
              </p>
            </div>
            <Button onClick={handleRefreshAll} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
          
          <div className="text-center py-12">
            <div className="text-red-500 text-lg font-medium mb-2">
              Erro ao carregar analytics avançados
            </div>
            <p className="text-muted-foreground mb-4">
              {analyticsError || automationsError || feedbackError}
            </p>
            <Button onClick={handleRefreshAll}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Analytics e Automações
            </h1>
            <p className="text-muted-foreground">
              Funil de conversão, automações de marketing e sistema de feedback
            </p>
          </div>
          <Button 
            onClick={handleRefreshAll} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Tudo
          </Button>
        </div>

        <Tabs defaultValue="funnel" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="funnel" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Funil de Conversão
            </TabsTrigger>
            <TabsTrigger value="segmentation" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Segmentação
            </TabsTrigger>
            <TabsTrigger value="automations" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automações
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback & NPS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="funnel" className="space-y-6">
            <ConversionFunnelChart 
              data={conversionFunnel} 
              loading={analyticsLoading} 
            />
            
            {/* Métricas Comportamentais */}
            {behaviorMetrics && !analyticsLoading && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-4">Comportamento dos Usuários</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duração média da sessão:</span>
                      <span className="font-medium">{Math.floor(behaviorMetrics.averageSessionDuration / 60)}m {behaviorMetrics.averageSessionDuration % 60}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Páginas por sessão:</span>
                      <span className="font-medium">{behaviorMetrics.pagesPerSession}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de rejeição:</span>
                      <span className="font-medium">{behaviorMetrics.bounceRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Usuários recorrentes:</span>
                      <span className="font-medium">{behaviorMetrics.returnUserRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-4">Páginas Mais Populares</h3>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Páginas de Entrada:</h4>
                    {behaviorMetrics.topEntryPages.slice(0, 4).map((page, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{page.page}</span>
                        <span className="text-muted-foreground">{page.entries}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="segmentation" className="space-y-6">
            {/* Segmentação de Usuários */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userSegmentation.map((segment, index) => (
                <div key={index} className="bg-card p-6 rounded-lg border">
                  <h3 className="font-semibold mb-2">{segment.segment}</h3>
                  <div className="text-3xl font-bold text-primary mb-1">{segment.users.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{segment.percentage}% do total</div>
                  <div className="mt-3 w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${segment.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Métricas Avançadas */}
            {advancedMetrics && (
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Métricas de Crescimento</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{advancedMetrics.newUsers}</div>
                    <div className="text-sm text-muted-foreground">Novos Usuários (mês)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{advancedMetrics.conversionRate.toFixed(2)}%</div>
                    <div className="text-sm text-muted-foreground">Taxa de Conversão</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">R$ {advancedMetrics.customerAcquisitionCost.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">CAC (Custo por Cliente)</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="automations" className="space-y-6">
            <AutomationManager
              automations={automations}
              stats={automationStats}
              loading={automationsLoading}
              triggering={triggering}
              onToggle={toggleAutomation}
              onTrigger={triggerAutomation}
            />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <FeedbackCollector
              feedbacks={feedbacks}
              npsMetrics={npsMetrics}
              feedbackStats={feedbackStats}
              loading={feedbackLoading}
              onUpdateStatus={updateFeedbackStatus}
              onDelete={deleteFeedback}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}