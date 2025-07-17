import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Shield,
  Activity
} from "lucide-react";
import { ValidationService, SystemHealth, ValidationResult } from "@/services/validationService";

export const SystemValidationPanel = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runValidation = async () => {
    setLoading(true);
    try {
      const result = await ValidationService.validateSystem();
      setHealth(result);
      setLastCheck(new Date());
    } catch (error) {
      console.error("Erro na validação:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]} className="ml-2">
        {status === 'success' ? 'OK' : 
         status === 'warning' ? 'Aviso' : 'Erro'}
      </Badge>
    );
  };

  const getOverallColor = (overall: SystemHealth['overall']) => {
    switch (overall) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
    }
  };

  const getProgressValue = () => {
    if (!health) return 0;
    return (health.summary.passed / health.summary.total) * 100;
  };

  const groupedResults = health?.results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, ValidationResult[]>) || {};

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Validação do Sistema
          <Button
            variant="outline"
            size="sm"
            onClick={runValidation}
            disabled={loading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {health && (
          <>
            {/* Status Geral */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <span className="font-medium">Status Geral:</span>
                  <span className={`font-semibold ${getOverallColor(health.overall)}`}>
                    {health.overall === 'healthy' ? 'Saudável' :
                     health.overall === 'warning' ? 'Com Avisos' : 'Crítico'}
                  </span>
                </div>
                {lastCheck && (
                  <span className="text-sm text-muted-foreground">
                    Última verificação: {lastCheck.toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso da Validação</span>
                  <span>{health.summary.passed}/{health.summary.total} testes passaram</span>
                </div>
                <Progress value={getProgressValue()} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {health.summary.passed}
                  </div>
                  <div className="text-sm text-muted-foreground">Sucessos</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-yellow-600">
                    {health.summary.warnings}
                  </div>
                  <div className="text-sm text-muted-foreground">Avisos</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-red-600">
                    {health.summary.errors}
                  </div>
                  <div className="text-sm text-muted-foreground">Erros</div>
                </div>
              </div>
            </div>

            {/* Alertas Críticos */}
            {health.summary.errors > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {health.summary.errors} erro(s) crítico(s) detectado(s). 
                  Verifique os detalhes abaixo para resolução.
                </AlertDescription>
              </Alert>
            )}

            {/* Resultados por Categoria */}
            <div className="space-y-4">
              <h3 className="font-semibold">Detalhes da Validação</h3>
              {Object.entries(groupedResults).map(([category, results]) => (
                <Card key={category} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {results.map((result, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="flex-shrink-0 mt-0.5">
                            {getStatusIcon(result.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{result.test}</span>
                              {getStatusBadge(result.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {result.message}
                            </p>
                            {result.details && (
                              <p className="text-xs text-muted-foreground bg-background p-2 rounded border">
                                {result.details}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Executando validações...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};