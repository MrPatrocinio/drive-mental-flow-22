/**
 * Background Music Debug Component
 * Responsabilidade: Debug do estado da música de fundo (apenas desenvolvimento)
 * Princípio SRP: Apenas informações de debug
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { Play, Pause, RefreshCw } from 'lucide-react';

export const BackgroundMusicDebug = () => {
  const {
    state,
    isEnabled,
    refresh
  } = useBackgroundMusic();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">🎵 Background Music Debug</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Enabled:</strong> {isEnabled ? '✅' : '❌'}
        </div>
        <div>
          <strong>Playing:</strong> {state.isPlaying ? '▶️' : '⏸️'}
        </div>
        <div>
          <strong>Loading:</strong> {state.isLoading ? '⏳' : '✅'}
        </div>
        <div>
          <strong>Error:</strong> {state.hasError ? '❌' : '✅'}
        </div>
        <div>
          <strong>Volume:</strong> {(state.volume * 100).toFixed(0)}%
        </div>
        <div>
          <strong>Current Music:</strong> {state.currentMusic?.title || 'None'}
          {state.currentMusic?.id === 'fallback' && (
            <span className="text-orange-600 ml-1">(Fallback)</span>
          )}
        </div>
        {state.currentMusic && (
          <div className="text-xs text-muted-foreground break-all">
            <strong>URL:</strong> {state.currentMusic.file_url}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refresh}
            title="Refresh Background Music"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};