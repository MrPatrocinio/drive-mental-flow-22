import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeedbackEntry, NPSMetrics, FeedbackStats } from "@/services/feedbackService";
import { MessageSquare, Star, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

export interface FeedbackCollectorProps {
  feedbacks: FeedbackEntry[];
  npsMetrics: NPSMetrics | null;
  feedbackStats: FeedbackStats | null;
  loading?: boolean;
  onUpdateStatus: (feedbackId: string, status: FeedbackEntry['status']) => Promise<boolean>;
  onDelete: (feedbackId: string) => Promise<boolean>;
}

/**
 * Coletor e visualizador de feedback/NPS
 * Responsabilidade: Interface para gerenciar feedback dos usuários
 */
export const FeedbackCollector = ({ 
  feedbacks, 
  npsMetrics, 
  feedbackStats, 
  loading,
  onUpdateStatus,
  onDelete 
}: FeedbackCollectorProps) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sistema de Feedback
            </CardTitle>
            <CardDescription>Carregando dados...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nps': return '⭐';
      case 'feature_request': return '💡';
      case 'bug_report': return '🐛';
      case 'general': return '💬';
      default: return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'nps': return 'bg-blue-100 text-blue-800';
      case 'feature_request': return 'bg-green-100 text-green-800';
      case 'bug_report': return 'bg-red-100 text-red-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNPSCategory = (score: number) => {
    if (score >= 9) return { label: 'Promotor', color: 'text-green-600' };
    if (score >= 7) return { label: 'Neutro', color: 'text-yellow-600' };
    return { label: 'Detrator', color: 'text-red-600' };
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filter === 'all') return true;
    return feedback.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Métricas NPS */}
      {npsMetrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{npsMetrics.npsScore.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">NPS Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{npsMetrics.promoters}</div>
                  <div className="text-sm text-muted-foreground">Promotores</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{npsMetrics.totalResponses}</div>
                  <div className="text-sm text-muted-foreground">Respostas</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-full ${
                  npsMetrics.trend === 'improving' ? 'bg-green-500' :
                  npsMetrics.trend === 'declining' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <div className="text-2xl font-bold">{npsMetrics.averageScore.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Média</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estatísticas de Feedback */}
      {feedbackStats && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{feedbackStats.totalFeedbacks}</div>
                <div className="text-sm text-muted-foreground">Total de Feedbacks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{feedbackStats.pendingReviews}</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{feedbackStats.resolvedIssues}</div>
                <div className="text-sm text-muted-foreground">Resolvidos</div>
              </div>
            </div>
            
            {feedbackStats.categoryCounts.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Categorias Mais Comuns:</h4>
                <div className="flex flex-wrap gap-2">
                  {feedbackStats.categoryCounts.slice(0, 5).map(({ category, count }) => (
                    <Badge key={category} variant="outline">
                      {category}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de Feedbacks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Feedbacks dos Usuários
              </CardTitle>
              <CardDescription>
                Gerencie feedback, sugestões e avaliações NPS
              </CardDescription>
            </div>
            
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="reviewed">Revisados</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filter === 'all' ? 'Nenhum feedback encontrado' : `Nenhum feedback ${filter} encontrado`}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">
                        {getTypeIcon(feedback.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{feedback.userName || 'Usuário Anônimo'}</span>
                          {feedback.type === 'nps' && feedback.score !== undefined && (
                            <Badge className={getNPSCategory(feedback.score).color}>
                              {feedback.score}/10 - {getNPSCategory(feedback.score).label}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {feedback.userEmail} • {new Date(feedback.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(feedback.type)}>
                        {feedback.type}
                      </Badge>
                      <Badge className={getStatusColor(feedback.status)}>
                        {feedback.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm">{feedback.message}</p>
                    {feedback.category && (
                      <Badge variant="outline" className="mt-2">
                        {feedback.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {feedback.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(feedback.id, 'reviewed')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Revisar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(feedback.id, 'resolved')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolver
                        </Button>
                      </>
                    )}
                    
                    {feedback.status === 'reviewed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(feedback.id, 'resolved')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Marcar como Resolvido
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(feedback.id)}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};