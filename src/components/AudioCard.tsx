
/**
 * Audio Card - Componente de card de áudio
 * Responsabilidade: UI de card de áudio
 * Princípio SRP: Apenas apresentação de áudio
 * Princípio DRY: Componente reutilizável
 * OTIMIZADO: React.memo para performance
 */

import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';
import { OfflineDownloadButton } from './OfflineDownloadButton';

export interface Audio {
  id: string;
  title: string;
  duration: string;
  url: string;
  tags?: string[];
  field_id?: string;
}

interface AudioCardProps {
  audio: Audio;
  onPlay: (audio: Audio) => void;
  showTags?: boolean;
}

const AudioCardComponent = ({ audio, onPlay, showTags = true }: AudioCardProps) => {
  const handlePlay = useCallback(() => {
    onPlay(audio);
  }, [audio, onPlay]);

  return (
    <Card className="group hover-scale transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">
              {audio.title}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Clock className="w-3 h-3" />
              <span>{audio.duration}</span>
            </div>

            {showTags && audio.tags && audio.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {audio.tags.slice(0, 2).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-2 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
                {audio.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{audio.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <FavoriteButton audioId={audio.id} audioTitle={audio.title} size="sm" />
            
            <OfflineDownloadButton
              audioId={audio.id}
              audioUrl={audio.url}
              audioTitle={audio.title}
              fieldId={audio.field_id || ''}
              duration={audio.duration}
              size="sm"
              variant="ghost"
              showProgress={false}
            />
            
            <Button
              size="sm"
              onClick={handlePlay}
              className="w-8 h-8 p-0"
            >
              <Play className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Otimização com React.memo para evitar re-renders desnecessários
export const AudioCard = React.memo(AudioCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.audio.id === nextProps.audio.id &&
    prevProps.audio.title === nextProps.audio.title &&
    prevProps.audio.duration === nextProps.audio.duration &&
    prevProps.audio.url === nextProps.audio.url &&
    prevProps.showTags === nextProps.showTags &&
    JSON.stringify(prevProps.audio.tags) === JSON.stringify(nextProps.audio.tags)
  );
});

AudioCard.displayName = 'AudioCard';
