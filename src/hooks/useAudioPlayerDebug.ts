
/**
 * Hook para debug do AudioPlayer
 * Responsabilidade: Lógica de debug e logging do player
 * Princípio SRP: Apenas funcionalidades de debug
 * Princípio DRY: Reutilizável para qualquer player
 */

import { useCallback, useRef } from 'react';
import { AudioDiagnosticsService, AudioDiagnosticResult } from '@/services/audioDiagnosticsService';

export interface AudioPlayerDebugInfo {
  playerState: any;
  audioElement: HTMLAudioElement | null;
  diagnostics?: AudioDiagnosticResult;
  lastPlayAttempt?: Date;
  playAttempts: number;
}

export const useAudioPlayerDebug = () => {
  const debugInfo = useRef<AudioPlayerDebugInfo>({
    playerState: {},
    audioElement: null,
    playAttempts: 0
  });

  const logPlayerState = useCallback((state: any, context: string) => {
    console.group(`🎵 AudioPlayer Debug - ${context}`);
    console.log('Estado atual:', state);
    console.log('Elemento de áudio:', debugInfo.current.audioElement);
    console.log('Tentativas de play:', debugInfo.current.playAttempts);
    console.log('Última tentativa:', debugInfo.current.lastPlayAttempt);
    console.groupEnd();
    
    debugInfo.current.playerState = state;
  }, []);

  const logPlayAttempt = useCallback(async (audioElement: HTMLAudioElement | null, audioUrl: string) => {
    debugInfo.current.playAttempts++;
    debugInfo.current.lastPlayAttempt = new Date();
    debugInfo.current.audioElement = audioElement;

    console.group('🎯 Tentativa de Play');
    console.log('URL:', audioUrl);
    console.log('Elemento válido:', !!audioElement);
    console.log('Ready state:', audioElement?.readyState);
    console.log('Network state:', audioElement?.networkState);
    console.log('Current time:', audioElement?.currentTime);
    console.log('Duration:', audioElement?.duration);
    console.log('Paused:', audioElement?.paused);
    console.log('Muted:', audioElement?.muted);
    console.log('Volume:', audioElement?.volume);
    console.groupEnd();
  }, []);

  const runDiagnostics = useCallback(async (audioUrl: string): Promise<AudioDiagnosticResult> => {
    console.log('🔍 Executando diagnósticos de áudio...');
    const result = await AudioDiagnosticsService.testAudioUrl(audioUrl);
    debugInfo.current.diagnostics = result;
    
    console.group('📋 Relatório de Diagnóstico');
    console.log(AudioDiagnosticsService.generateReport(result));
    console.groupEnd();
    
    return result;
  }, []);

  const getDebugInfo = useCallback((): AudioPlayerDebugInfo => {
    return { ...debugInfo.current };
  }, []);

  return {
    logPlayerState,
    logPlayAttempt,
    runDiagnostics,
    getDebugInfo
  };
};
