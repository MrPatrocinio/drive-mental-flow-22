/**
 * DemoPage - Página de demonstração gratuita
 * Responsabilidade: Exibir áudio de demonstração para visitantes
 * Princípio SRP: Apenas lógica de demonstração
 * Princípio KISS: Interface simples e direta
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, Volume2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DemoService, DemoAudio } from '@/services/supabase/demoService';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

export default function DemoPage() {
  const navigate = useNavigate();
  const [demoAudio, setDemoAudio] = useState<DemoAudio | null>(null);
  const [loading, setLoading] = useState(true);
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    loadDemoAudio();
  }, []);

  const loadDemoAudio = async () => {
    try {
      setLoading(true);
      const audio = await DemoService.getDemoAudio();
      setDemoAudio(audio);
      
      if (!audio) {
        toast.error('Nenhuma demonstração disponível no momento');
      }
    } catch (error) {
      console.error('Error loading demo audio:', error);
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
              onClick={() => navigate('/')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Button>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>Demonstração Temporariamente Indisponível</CardTitle>
                <CardDescription>
                  Não há demonstração configurada no momento. Tente novamente mais tarde.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={() => navigate('/pagamento')} className="mr-4">
                  Ver Planos Completos
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Voltar ao Início
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Button>

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
                    <Badge variant="outline">{demoAudio.field_title}</Badge>
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
              onClick={() => navigate('/pagamento')}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Acessar Biblioteca Completa
            </Button>
          </div>

          {/* Call to Action */}
          <Card className="card-gradient">
            <CardContent className="text-center p-8">
              <h3 className="text-xl font-semibold mb-4">
                Gostou da demonstração?
              </h3>
              <div className="space-y-4 mb-6">
                <p className="text-muted-foreground">
                  Transforme sua vida financeira e pessoal com áudios cientificamente desenvolvidos
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-premium rounded-full"></div>
                    <span>Abundância financeira</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-premium rounded-full"></div>
                    <span>Autoconfiança elevada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-premium rounded-full"></div>
                    <span>Relacionamentos saudáveis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-premium rounded-full"></div>
                    <span>Sucesso profissional</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Button onClick={() => navigate('/pagamento')} size="lg" className="px-8">
                  Faça o upgrade que sua mente merece
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}