import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioValidationService } from '@/services/audioValidationService';

interface UseAudioPlayer {
  audioUrl: string;
  autoplay?: boolean;
}

interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
  volume: number;
  isMuted: boolean;
}

export const useAudioPlayer = ({ audioUrl, autoplay = false }: UseAudioPlayer) => {
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    error: null,
    volume: 1,
    isMuted: false,
  });

  const audioRef = useRef<HTMLAudioElement>(new Audio(audioUrl));
  const retryCountRef = useRef(0); // Contador de tentativas

  const { isPlaying, isLoading, currentTime, duration, error, volume, isMuted } = playerState;

  // Function to set the volume
  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setPlayerState(prevState => ({ ...prevState, volume: newVolume }));
    }
  }, []);

  // Function to toggle mute
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setPlayerState(prevState => ({ ...prevState, isMuted: !isMuted }));
    }
  }, [isMuted]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setPlayerState(prevState => ({ ...prevState, isPlaying: true })))
        .catch(err => {
          console.error("Erro ao tentar reproduzir:", err);
          setPlayerState(prevState => ({ ...prevState, error: 'Falha ao iniciar a reprodução' }));
        });
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayerState(prevState => ({ ...prevState, isPlaying: false }));
    }
  }, []);

  const togglePlay = useCallback(() => {
    isPlaying ? pause() : play();
  }, [isPlaying, play, pause]);

  const setTime = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState(prevState => ({ ...prevState, currentTime: time }));
    }
  }, []);

  const setError = useCallback((message: string) => {
    setPlayerState(prevState => ({ ...prevState, error: message, isLoading: false }));
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setPlayerState(prevState => ({ ...prevState, isLoading: loading }));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setPlayerState(prevState => ({
        ...prevState,
        isLoading: false,
        duration: audio.duration
      }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prevState => ({
        ...prevState,
        currentTime: audio.currentTime
      }));
    };

    const handleEnded = () => {
      setPlayerState(prevState => ({ ...prevState, isPlaying: false, currentTime: 0 }));
    };

    const handleError = (event: Event) => {
      console.error('useAudioPlayer: Erro ao carregar o áudio', event);
      
      // Tenta validar URL e reconectar
      retryCountRef.current += 1;
      console.log(`useAudioPlayer: Tentativa #${retryCountRef.current} de reconexão...`);

      if (retryCountRef.current <= 3) {
        // Resetar o audio
        audio.pause();
        audio.removeAttribute('src');
        audio.load();

        setPlayerState(prevState => ({
          ...prevState,
          isPlaying: false,
          isLoading: true,
          error: `Erro ao carregar. Tentando novamente... (${retryCountRef.current}/3)`
        }));

        // Forçar a redefinição da URL após um pequeno atraso
        setTimeout(() => {
          audio.src = audioUrl;
          audio.load();
          if (isPlaying || autoplay) {
            audio.play().catch(e => console.error("Erro ao reproduzir após a reconexão:", e));
          }
        }, 500);
      } else {
        setError('Não foi possível carregar o áudio. Verifique a URL ou tente novamente mais tarde.');
        setIsLoading(false);
      }
    };

    // Iniciar o carregamento
    setIsLoading(true);
    setPlayerState(prevState => ({ ...prevState, error: null }));
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.volume = volume; // Garante que o volume seja aplicado corretamente
    audio.muted = isMuted; // Garante que o estado de mute seja aplicado corretamente
    audio.preload = 'metadata'; // Carrega apenas os metadados

    // Reproduzir automaticamente se autoplay for true
    if (autoplay) {
      audio.play()
        .then(() => setPlayerState(prevState => ({ ...prevState, isPlaying: true })))
        .catch(err => {
          console.warn("useAudioPlayer: Autoplay impedido pelo navegador:", err);
          // Não define um erro aqui, apenas loga o aviso
        });
    }

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [audioUrl, setError, setIsLoading, autoplay, volume, isMuted, isPlaying]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleStalled = () => {
      console.warn('useAudioPlayer: A reprodução está travando. Tentando reconectar...');
      setError('A reprodução está travando. Tentando reconectar...');
      
      // Reiniciar a reprodução
      audio.pause();
      audio.load();
      if (isPlaying) {
        audio.play().catch(e => console.error("Erro ao reproduzir após o travamento:", e));
      }
    };

    audio.addEventListener('stalled', handleStalled);

    return () => {
      audio.removeEventListener('stalled', handleStalled);
    };
  }, [isPlaying, setError]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleWaiting = () => {
      console.log('useAudioPlayer: Esperando dados...');
      setIsLoading(true);
    };

    const handlePlaying = () => {
       setIsLoading(false);
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [setIsLoading]);

  useEffect(() => {
    // Reseta o contador de tentativas quando a URL muda
    retryCountRef.current = 0;
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;

    const checkConnectivity = async () => {
      if (!audioUrl) return;

      // Tentar validar URL antes de reproduzir se houve erro
      if (retryCountRef.current === 0) {
        console.log('useAudioPlayer: Validando URL antes da primeira tentativa');
        const validation = await AudioValidationService.validateAudioUrl(audioUrl);
        
        if (!validation.isValid) {
          console.error('useAudioPlayer: URL inválida:', validation.error);
          setError(`URL inválida: ${validation.error}`);
          setIsLoading(false);
          return;
        }

        // Testar conectividade com Supabase
        const connectivity = await AudioValidationService.testSupabaseConnectivity();
        if (!connectivity.isValid) {
          console.warn('useAudioPlayer: Problemas de conectividade:', connectivity.error);
        }
      }
    };

    checkConnectivity();
  }, [audioUrl, setError, setIsLoading]);

  return {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    error,
    volume,
    isMuted,
    play,
    pause,
    togglePlay,
    setTime,
    setVolume,
    toggleMute
  };
};
