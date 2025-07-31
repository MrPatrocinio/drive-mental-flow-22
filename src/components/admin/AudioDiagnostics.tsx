import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { AudioValidationService } from '@/services/audioValidationService';
import { AudioService } from '@/services/supabase/audioService';
import { useToast } from '@/hooks/use-toast';

interface InvalidAudio {
  id: string;
  title: string;
  url: string;
  validationError?: string;
}

/**
 * Componente responsável por diagnosticar e corrigir problemas nos áudios
 * Segue o princípio SRP: apenas diagnóstico de áudios
 */
export const AudioDiagnostics = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [storageStatus, setStorageStatus] = useState<{ isValid: boolean; error?: string } | null>(null);
  const [invalidAudios, setInvalidAudios] = useState<InvalidAudio[]>([]);
  const [isFixing, setIsFixing] = useState(false);
  const { toast } = useToast();

  const checkStorageConfiguration = async () => {
    setIsChecking(true);
    try {
      const status = await AudioValidationService.validateStorageConfiguration();
      setStorageStatus(status);
    } catch (error) {
      console.error('Erro ao verificar storage:', error);
      setStorageStatus({ 
        isValid: false, 
        error: 'Erro ao verificar configuração do storage' 
      });
    } finally {
      setIsChecking(false);
    }
  };

  const checkAudios = async () => {
    setIsChecking(true);
    try {
      const invalid = await AudioValidationService.findInvalidAudios();
      setInvalidAudios(invalid);
      
      toast({
        title: "Verificação concluída",
        description: `Encontrados ${invalid.length} áudios com problemas`,
        variant: invalid.length > 0 ? "destructive" : "default"
      });
    } catch (error) {
      console.error('Erro ao verificar áudios:', error);
      toast({
        variant: "destructive",
        title: "Erro na verificação",
        description: "Não foi possível verificar os áudios"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const removeInvalidAudio = async (audioId: string) => {
    try {
      await AudioService.delete(audioId);
      setInvalidAudios(prev => prev.filter(audio => audio.id !== audioId));
      
      toast({
        title: "Áudio removido",
        description: "Áudio com URL inválida foi removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover áudio:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o áudio"
      });
    }
  };

  const fixAllInvalidAudios = async () => {
    setIsFixing(true);
    try {
      const promises = invalidAudios.map(audio => AudioService.delete(audio.id));
      await Promise.all(promises);
      
      setInvalidAudios([]);
      toast({
        title: "Correção concluída",
        description: `${promises.length} áudios inválidos foram removidos`
      });
    } catch (error) {
      console.error('Erro ao corrigir áudios:', error);
      toast({
        variant: "destructive",
        title: "Erro na correção",
        description: "Não foi possível corrigir todos os áudios"
      });
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    checkStorageConfiguration();
    checkAudios();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Diagnóstico do Sistema de Áudio
          </CardTitle>
          <CardDescription>
            Verificação e correção de problemas na configuração dos áudios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {storageStatus?.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Configuração do Storage</p>
                <p className="text-sm text-muted-foreground">
                  {storageStatus?.isValid 
                    ? "Bucket 'audios' configurado corretamente" 
                    : storageStatus?.error || "Verificando..."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkStorageConfiguration}
              disabled={isChecking}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              Verificar
            </Button>
          </div>

          {/* Invalid Audios */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Áudios com Problemas</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkAudios}
                  disabled={isChecking}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                  Verificar
                </Button>
                {invalidAudios.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={fixAllInvalidAudios}
                    disabled={isFixing}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover Todos
                  </Button>
                )}
              </div>
            </div>

            {invalidAudios.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhum áudio com problemas encontrado!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {invalidAudios.map((audio) => (
                  <div key={audio.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{audio.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{audio.url}</p>
                      <Badge variant="destructive" className="mt-1">
                        {audio.validationError || 'URL inválida'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeInvalidAudio(audio.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};