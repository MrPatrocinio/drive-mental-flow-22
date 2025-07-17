import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { AudioPreferencesPanel } from "@/components/AudioPreferencesPanel";
import { AudioPreferences, audioPreferencesService } from "@/services/audioPreferencesService";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  onRepeatComplete?: () => void;
}

export const AudioPlayer = ({ audioUrl, title, onRepeatComplete }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);
  const [preferences, setPreferences] = useState<AudioPreferences>(audioPreferencesService.getPreferences());
  const [showPreferences, setShowPreferences] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    const handleEnded = () => {
      const newRepeatCount = repeatCount + 1;
      setRepeatCount(newRepeatCount);
      onRepeatComplete?.();
      
      // Check if we should continue repeating
      const shouldContinue = preferences.repeatCount === 0 || newRepeatCount < preferences.repeatCount;
      
      if (shouldContinue) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onRepeatComplete]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : preferences.volume / 100;
    }
  }, [preferences.volume, isMuted]);

  useEffect(() => {
    // Auto-play functionality
    if (preferences.autoPlay && audioRef.current && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl, preferences.autoPlay]);

  const handlePreferencesChange = (newPreferences: AudioPreferences) => {
    setPreferences(newPreferences);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setRepeatCount(0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  return (
    <div className="card-gradient rounded-xl p-6 space-y-6">
      <audio ref={audioRef} src={audioUrl} />
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <div className="text-sm text-muted-foreground">
          Repetições: <span className="text-primary font-semibold">{repeatCount}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {preferences.showProgress && (
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="audio"
          size="audio"
          onClick={resetAudio}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="premium"
          size="audio"
          onClick={togglePlay}
          className="w-16 h-16"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>

        <Button
          variant="audio"
          size="audio"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="audio"
          size="audio"
          onClick={() => setShowPreferences(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[preferences.volume]}
          max={100}
          step={1}
          onValueChange={(value) => {
            const newPreferences = { ...preferences, volume: value[0] };
            setPreferences(newPreferences);
            audioPreferencesService.updatePreferences({ volume: value[0] });
          }}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground min-w-[3ch]">
          {preferences.volume}%
        </span>
      </div>

      {/* Repeat Count Display */}
      <div className="text-center text-sm text-muted-foreground">
        {preferences.repeatCount === 0 ? (
          <span>Repetição infinita ativada</span>
        ) : (
          <span>
            Repetições: {repeatCount}/{preferences.repeatCount}
          </span>
        )}
      </div>

      {/* Preferences Panel */}
      <AudioPreferencesPanel
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onPreferencesChange={handlePreferencesChange}
      />
    </div>
  );
};