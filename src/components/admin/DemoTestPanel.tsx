
/**
 * DemoTestPanel - Componente para testar funcionalidade de demonstração
 * Responsabilidade: Verificar se áudios de demo estão acessíveis publicamente
 * Princípio SRP: Apenas teste de funcionalidade de demo
 * Princípio KISS: Interface simples para verificação
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { DemoService, DemoAudio } from '@/services/supabase/demoService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  status: 'success' | 'error' | 'warning';
  message: string;
}

export const DemoTestPanel: React.FC = () => {
  const [currentDemoAudio, setCurrentDemoAudio] = useState<DemoAudio | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDemoAudio();
  }, []);

  const loadDemoAudio = async () => {
    try {
      const demoAudio = await DemoService.getDemoAudio();
      setCurrentDemoAudio(demoAudio);
    } catch (error) {
      console.error('Error loading demo audio:', error);
    }
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    const results: TestResult[] = [];

    try {
      // Test 1: Check if demo audio is configured
      if (!currentDemoAudio) {
        results.push({
          status: 'warning',
          message: 'Nenhum áudio configurado como demonstração'
        });
        setTestResults(results);
        setLoading(false);
        return;
      }

      results.push({
        status: 'success',
        message: `Áudio de demo configurado: "${currentDemoAudio.title}"`
      });

      // Test 2: Try to access demo audio without authentication
      const { data: audioData, error: audioError } = await supabase
        .from('audios')
        .select('*')
        .eq('id', currentDemoAudio.id)
        .single();

      if (audioError) {
        results.push({
          status: 'error',
          message: `Erro ao acessar áudio de demo: ${audioError.message}`
        });
      } else {
        results.push({
          status: 'success',
          message: 'Áudio de demo acessível publicamente ✓'
        });
      }

      // Test 4: Verify landing content configuration
      const { data: landingData, error: landingError } = await supabase
        .from('landing_content')
        .select('content')
        .eq('section', 'demo_config')
        .single();

      if (landingError) {
        results.push({
          status: 'error',
          message: 'Erro ao verificar configuração de demo na landing page'
        });
      } else {
        const config = landingData.content as any;
        if (config.demo_audio_id === currentDemoAudio.id) {
          results.push({
            status: 'success',
            message: 'Configuração de demo na landing page está correta ✓'
          });
        } else {
          results.push({
            status: 'error',
            message: 'Inconsistência na configuração de demo'
          });
        }
      }

    } catch (error) {
      results.push({
        status: 'error',
        message: `Erro durante os testes: ${(error as Error).message}`
      });
    }

    setTestResults(results);
    setLoading(false);

    // Show toast with overall result
    const hasErrors = results.some(r => r.status === 'error');
    if (hasErrors) {
      toast.error('Testes falharam - verifique os resultados');
    } else {
      toast.success('Todos os testes passaram - demonstração funcionando!');
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-800 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-800 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-800 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Teste de Demonstração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Demo Audio */}
        {currentDemoAudio && (
          <div className="space-y-3">
            <h4 className="font-medium">Áudio de Demonstração Atual</h4>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{currentDemoAudio.title}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{currentDemoAudio.field_title}</Badge>
                    <span>•</span>
                    <span>{currentDemoAudio.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Button */}
        <div>
          <Button 
            onClick={runTests} 
            disabled={loading || !currentDemoAudio}
            className="w-full"
          >
            {loading ? 'Executando Testes...' : 'Executar Testes de Demonstração'}
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Resultados dos Testes</h4>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded-lg ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-2">
                    {getStatusIcon(result.status)}
                    <span className="text-sm flex-1">{result.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Como usar este teste</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Este teste verifica se a demonstração está funcionando corretamente</li>
            <li>• Confirma se áudios premium configurados como demo são acessíveis</li>
            <li>• Valida a configuração na landing page</li>
            <li>• Execute após configurar um novo áudio de demonstração</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
