
/**
 * AudioDiagnosticsPanel - Painel de diagnóstico de áudio
 * Responsabilidade: Interface para diagnóstico de problemas de áudio
 * Princípio SRP: Apenas UI de diagnóstico
 * Princípio KISS: Interface simples e clara
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, RefreshCw, Wifi, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { AudioDiagnosticsService, AudioDiagnosticResult } from '@/services/audioDiagnosticsService';
import { useToast } from '@/hooks/use-toast';

interface AudioDiagnosticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  audioUrl: string;
  audioElement: HTMLAudioElement | null;
  playerState: any;
}

export const AudioDiagnosticsPanel = ({
  isOpen,
  onClose,
  audioUrl,
  audioElement,
  playerState
}: AudioDiagnosticsPanelProps) => {
  const [diagnostics, setDiagnostics] = useState<AudioDiagnosticResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const result = await AudioDiagnosticsService.testAudioUrl(audioUrl);
      setDiagnostics(result);
      
      if (result.isValid) {
        toast({
          title: "Diagnóstico Concluído",
          description: "Áudio validado com sucesso!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Problema Detectado",
          description: result.error || "Erro na validação do áudio",
        });
      }
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      toast({
        variant: "destructive",
        title: "Erro no Diagnóstico",
        description: "Não foi possível executar o diagnóstico",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testDirectPlay = async () => {
    if (!audioElement) {
      toast({
        variant: "destructive",
        title: "Elemento não encontrado",
        description: "Elemento de áudio não está disponível",
      });
      return;
    }

    try {
      await audioElement.play();
      toast({
        title: "Teste Bem-sucedido",
        description: "Áudio reproduzido diretamente com sucesso",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        variant: "destructive",
        title: "Falha no Teste",
        description: `Erro: ${errorMessage}`,
      });
    }
  };

  const StatusIcon = ({ status }: { status: boolean | undefined }) => {
    if (status === undefined) return null;
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Diagnóstico de Áudio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Estado Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado Atual do Player</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span>Pode Reproduzir:</span>
                  <Badge variant={playerState.canPlay ? "default" : "destructive"}>
                    {playerState.canPlay ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Está Pronto:</span>
                  <Badge variant={playerState.isReady ? "default" : "destructive"}>
                    {playerState.isReady ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Carregando:</span>
                  <Badge variant={playerState.isLoading ? "secondary" : "outline"}>
                    {playerState.isLoading ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Tem Erro:</span>
                  <Badge variant={playerState.hasError ? "destructive" : "default"}>
                    {playerState.hasError ? "Sim" : "Não"}
                  </Badge>
                </div>
              </div>
              
              {playerState.errorMessage && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{playerState.errorMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Elementos HTML */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Elemento de Áudio</CardTitle>
            </CardHeader>
            <CardContent>
              {audioElement ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Ready State: <Badge variant="outline">{audioElement.readyState}</Badge></div>
                    <div>Network State: <Badge variant="outline">{audioElement.networkState}</Badge></div>
                    <div>Duration: <Badge variant="outline">{audioElement.duration || 'N/A'}</Badge></div>
                    <div>Current Time: <Badge variant="outline">{audioElement.currentTime}</Badge></div>
                    <div>Paused: <Badge variant={audioElement.paused ? "secondary" : "default"}>{audioElement.paused ? "Sim" : "Não"}</Badge></div>
                    <div>Muted: <Badge variant={audioElement.muted ? "secondary" : "default"}>{audioElement.muted ? "Sim" : "Não"}</Badge></div>
                  </div>
                  <Button 
                    onClick={testDirectPlay} 
                    variant="outline" 
                    size="sm"
                    className="mt-4"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Testar Reprodução Direta
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Elemento de áudio não encontrado</p>
              )}
            </CardContent>
          </Card>

          {/* URL do Áudio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">URL do Áudio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="break-all text-sm bg-muted p-3 rounded-lg">
                {audioUrl}
              </div>
            </CardContent>
          </Card>

          {/* Diagnósticos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Diagnósticos Avançados
                <Button 
                  onClick={runDiagnostics} 
                  disabled={isRunning}
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                  {isRunning ? 'Executando...' : 'Executar Teste'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {diagnostics ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={diagnostics.isValid} />
                    <span className="font-medium">
                      Status: {diagnostics.isValid ? 'Válido' : 'Inválido'}
                    </span>
                  </div>
                  
                  {diagnostics.error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{diagnostics.error}</p>
                    </div>
                  )}
                  
                  {diagnostics.details && (
                    <div className="space-y-2">
                      <Separator />
                      <h4 className="font-medium">Detalhes:</h4>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <span>Pode carregar metadata:</span>
                          <StatusIcon status={diagnostics.details.canLoadMetadata} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Pode reproduzir:</span>
                          <StatusIcon status={diagnostics.details.canPlay} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Problema de rede:</span>
                          <StatusIcon status={!diagnostics.details.hasNetworkIssue} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Problema CORS:</span>
                          <StatusIcon status={!diagnostics.details.hasCorsIssue} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Autoplay bloqueado:</span>
                          <StatusIcon status={!diagnostics.details.hasAutoplayIssue} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Clique em "Executar Teste" para obter diagnósticos detalhados</p>
              )}
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
