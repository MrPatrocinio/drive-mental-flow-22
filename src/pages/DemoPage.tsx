
/**
 * DemoPage - Página de demonstração gratuita
 * Responsabilidade: Exibir áudio de demonstração para visitantes
 * Princípio SRP: Apenas lógica de demonstração
 * Princípio KISS: Interface simples e direta
 * MELHORADO: Com validação robusta e fallback
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Volume2, RefreshCw, AlertTriangle } from 'lucide-react';
import { FieldService } from '@/services/supabase/fieldService';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Header } from '@/components/Header';
import { BackgroundMusicDebug } from '@/components/BackgroundMusicDebug';
import { toast } from 'sonner';
import { Audio } from '@/services/supabase/audioService';
import { DemoAudioValidationService } from '@/services/demoAudioValidationService';

// Hook seguro para navegação que funciona dentro e fora do contexto do Router
const useSafeNavigate = () => {
  try {
    const { useNavigate } = require('react-router-dom');
    return useNavigate();
  } catch (error) {
    return (path: string) => {
      window.location.href = path;
    };
  }
};

export default function DemoPage() {
  const navigate = useSafeNavigate();
  const [demoAudio, setDemoAudio] = useState<Audio | null>(null);
  const [fieldTitle, setFieldTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string>('');
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    loadDemoAudio();
  }, []);

  const loadDemoAudio = async () => {
    try {
      setLoading(true);
      setValidationError('');
      console.log('DemoPage: Carregando áudio de demonstração');
      
      // Usar o serviço de validação (princípio SRP)
      const validation = await DemoAudioValidationService.validateCurrentDemoAudio();
      
      if (validation.isValid && validation.audio) {
        console.log('DemoPage: Áudio demo válido encontrado:', validation.audio.title);
        setDemoAudio(validation.audio);
        
        // Buscar título do campo
        try {
          const field = await FieldService.getById(validation.audio.field_id);
          setFieldTitle(field?.title || 'Campo não encontrado');
        } catch (error) {
          console.error('DemoPage: Erro ao buscar campo:', error);
          setFieldTitle('Campo não encontrado');
        }
      } else {
        console.log('DemoPage: Áudio demo inválido, buscando alternativa');
        setValidationError(validation.error || 'Erro desconhecido');
        
        // Buscar alternativa válida (princípio KISS - fallback simples)
        const alternative = await DemoAudioValidationService.findValidDemoAlternative();
        
        if (alternative) {
          console.log('DemoPage: Usando áudio alternativo:', alternative.title);
          setDemoAudio(alternative);
          
          try {
            const field = await FieldService.getById(alternative.field_id);
            setFieldTitle(field?.title || 'Campo não encontrado');
          } catch (error) {
            console.error('DemoPage: Erro ao buscar campo alternativo:', error);
            setFieldTitle('Campo não encontrado');
          }
          
          toast.info('Usando áudio alternativo para demonstração');
        } else {
          console.log('DemoPage: Nenhuma alternativa válida encontrada');
          setDemoAudio(null);
          toast.error('Nenhuma demonstração disponível no momento');
        }
      }
    } catch (error) {
      console.error('DemoPage: Erro ao carregar áudio demo:', error);
      setValidationError('Erro ao carregar demonstração');
      toast.error('Erro ao carregar demonstração');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayStart = () => {
    setPlayCount(prev => prev + 1);
  };

  const handleRestartDemo = () => {
    setPlayCount(0);
    toast.success('Demonstração reiniciada!');
  };

  // Função segura para navegação
  const handleNavigation = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.warn('Navegação via Router falhou, usando window.location:', error);
      window.location.href = path;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg text-muted-foreground">Carregando demonstração...</p>
            </div>
          </div>
        </div>
        <BackgroundMusicDebug />
      </div>
    );
  }

  if (!demoAudio) {
    return (
      <div className="min-h-screen hero-gradient">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Button>

            <Card>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                  <CardTitle>Demonstração Temporariamente Indisponível</CardTitle>
                </div>
                <CardDescription>
                  {validationError || 'Não há demonstração configurada no momento.'} Tente novamente mais tarde.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Button onClick={loadDemoAudio} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => handleNavigation('/pagamento')}>
                    Ver Planos Completos
                  </Button>
                  <Button variant="outline" onClick={() => handleNavigation('/')}>
                    Voltar ao Início
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <BackgroundMusicDebug />
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Navegação */}
          <Button
            variant="ghost"
            onClick={() => handleNavigation('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Button>

          {/* Aviso se usando áudio alternativo */}
          {validationError && (
            <Card className="mb-6 border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">
                    Áudio demo original indisponível. Usando áudio alternativo para demonstração.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">Demonstração</span>
              <br />
              <span className="text-premium">Gratuita</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experimente nosso Drive Mental gratuitamente. Configure e ouça quantas vezes quiser!
            </p>
          </div>

          {/* Card do Áudio de Demonstração */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-primary" />
                    {demoAudio.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{fieldTitle}</Badge>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{demoAudio.duration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Reproduções</p>
                  <p className="text-2xl font-bold text-primary">{playCount}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AudioPlayer
                audioUrl={demoAudio.url}
                title={demoAudio.title}
                onRepeatComplete={handlePlayStart}
              />
            </CardContent>
          </Card>

          {/* Controles */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              variant="outline"
              onClick={handleRestartDemo}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reiniciar Contador
            </Button>
            <Button
              onClick={() => handleNavigation('/pagamento')}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Acessar Biblioteca Completa
            </Button>
          </div>

          {/* Call to Action */}
          <Card className="card-gradient">
            <CardContent className="text-center p-8">
              <h3 className="text-2xl font-bold mb-4">
                Gostou da demonstração?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Transforme sua vida financeira e pessoal com áudios cientificamente desenvolvidos
              </p>
              
              <div className="bg-background/10 backdrop-blur-sm rounded-xl p-6 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/20 hover:bg-background/30 transition-all duration-300 hover-scale">
                    <div className="text-2xl">💰</div>
                    <span className="font-medium">Abundância financeira</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/20 hover:bg-background/30 transition-all duration-300 hover-scale">
                    <div className="text-2xl">✨</div>
                    <span className="font-medium">Autoconfiança elevada</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/20 hover:bg-background/30 transition-all duration-300 hover-scale">
                    <div className="text-2xl">❤️</div>
                    <span className="font-medium">Relacionamentos saudáveis</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/20 hover:bg-background/30 transition-all duration-300 hover-scale">
                    <div className="text-2xl">🚀</div>
                    <span className="font-medium">Sucesso profissional</span>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => handleNavigation('/pagamento')} size="lg" className="px-8 py-4 text-lg animate-fade-in">
                Sua mente Merece!
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Componente de Debug Temporário */}
      <BackgroundMusicDebug />
    </div>
  );
}
