
/**
 * VideoService - Gerenciamento de vídeos da landing page
 * Responsabilidade: CRUD de vídeos e controle do vídeo ativo
 * Princípio SRP: Apenas operações relacionadas a vídeos
 * Princípio SSOT: Fonte única da verdade para vídeos
 */

import { supabase } from '@/integrations/supabase/client';
import { VideoUploadService } from './videoUploadService';

export interface VideoControls {
  allowPause: boolean;
  allowVolumeControl: boolean;
  allowSeek: boolean;
  allowFullscreen: boolean;
  allowKeyboardControls: boolean;
  showControls: boolean;
  autoplay: boolean;
  muted: boolean;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  type: 'youtube' | 'upload' | 'atomicat';
  thumbnail?: string;
  description?: string;
  created_at: string;
  video_controls?: VideoControls;
}

export interface VideoSection {
  active_video_id: string | null;
  videos: Video[];
}

export class VideoService {
  /**
   * Busca todos os vídeos disponíveis
   */
  static async getVideos(): Promise<VideoSection> {
    try {
      console.log('VideoService: Buscando vídeos');
      const { data, error } = await supabase
        .from('landing_content')
        .select('content')
        .eq('section', 'videos')
        .single();

      if (error) throw error;

      const videoData = (data?.content as any) || {
        active_video_id: null,
        videos: []
      };

      return videoData;
    } catch (error) {
      console.error('VideoService: Erro ao buscar vídeos:', error);
      return {
        active_video_id: null,
        videos: []
      };
    }
  }

  /**
   * Busca o vídeo ativo
   */
  static async getActiveVideo(): Promise<Video | null> {
    try {
      const videoSection = await this.getVideos();
      
      if (!videoSection.active_video_id) {
        return null;
      }

      const activeVideo = videoSection.videos.find(
        video => video.id === videoSection.active_video_id
      );

      return activeVideo || null;
    } catch (error) {
      console.error('VideoService: Erro ao buscar vídeo ativo:', error);
      return null;
    }
  }

  /**
   * Gera controles padrão para novos vídeos
   */
  static getDefaultVideoControls(): VideoControls {
    return {
      allowPause: true,
      allowVolumeControl: true,
      allowSeek: true,
      allowFullscreen: true,
      allowKeyboardControls: true,
      showControls: true,
      autoplay: false,
      muted: false
    };
  }

  /**
   * Adiciona um novo vídeo
   */
  static async addVideo(videoData: Omit<Video, 'id' | 'created_at'>): Promise<void> {
    try {
      console.log('VideoService: Adicionando novo vídeo');
      const currentData = await this.getVideos();
      
      const newVideo: Video = {
        id: `video_${Date.now()}`,
        ...videoData,
        video_controls: videoData.video_controls || this.getDefaultVideoControls(),
        created_at: new Date().toISOString()
      };

      const updatedData: VideoSection = {
        ...currentData,
        videos: [...currentData.videos, newVideo]
      };

      await this.saveVideoSection(updatedData);
      console.log('VideoService: Vídeo adicionado com sucesso');
    } catch (error) {
      console.error('VideoService: Erro ao adicionar vídeo:', error);
      throw error;
    }
  }

  /**
   * Remove um vídeo
   */
  static async deleteVideo(videoId: string): Promise<void> {
    try {
      console.log('VideoService: Removendo vídeo');
      const currentData = await this.getVideos();
      
      // Encontrar o vídeo que será removido
      const videoToDelete = currentData.videos.find(video => video.id === videoId);
      
      // Se for um vídeo do storage, remover do Supabase Storage
      if (videoToDelete && videoToDelete.type === 'upload') {
        await VideoUploadService.deleteVideo(videoToDelete.url);
      }
      
      const updatedData: VideoSection = {
        active_video_id: currentData.active_video_id === videoId ? null : currentData.active_video_id,
        videos: currentData.videos.filter(video => video.id !== videoId)
      };

      await this.saveVideoSection(updatedData);
      console.log('VideoService: Vídeo removido com sucesso');
    } catch (error) {
      console.error('VideoService: Erro ao remover vídeo:', error);
      throw error;
    }
  }

  /**
   * Atualiza um vídeo existente
   */
  static async updateVideo(videoId: string, videoData: Partial<Omit<Video, 'id' | 'created_at'>>): Promise<void> {
    try {
      console.log('VideoService: Atualizando vídeo');
      const currentData = await this.getVideos();
      
      const updatedData: VideoSection = {
        ...currentData,
        videos: currentData.videos.map(video => 
          video.id === videoId 
            ? { ...video, ...videoData }
            : video
        )
      };

      await this.saveVideoSection(updatedData);
      console.log('VideoService: Vídeo atualizado com sucesso');
    } catch (error) {
      console.error('VideoService: Erro ao atualizar vídeo:', error);
      throw error;
    }
  }

  /**
   * Define qual vídeo está ativo
   */
  static async setActiveVideo(videoId: string | null): Promise<void> {
    try {
      console.log('VideoService: Definindo vídeo ativo');
      const currentData = await this.getVideos();
      
      const updatedData: VideoSection = {
        ...currentData,
        active_video_id: videoId
      };

      await this.saveVideoSection(updatedData);
      console.log('VideoService: Vídeo ativo definido com sucesso');
    } catch (error) {
      console.error('VideoService: Erro ao definir vídeo ativo:', error);
      throw error;
    }
  }

  /**
   * Salva a seção de vídeos no banco
   * Método privado para evitar duplicação
   */
  private static async saveVideoSection(videoSection: VideoSection): Promise<void> {
    const { error } = await supabase
      .from('landing_content')
      .upsert({
        section: 'videos',
        content: videoSection as any
      }, {
        onConflict: 'section',
        ignoreDuplicates: false
      });

    if (error) throw error;

    // Notificar mudança via DataSync
    import('@/services/dataSync').then(({ DataSyncService }) => {
      DataSyncService.forceNotification('videos_changed', { event: 'UPDATE', new: videoSection });
      DataSyncService.forceNotification('content_changed', { event: 'UPDATE', new: videoSection });
    });
  }

  /**
   * Converte URL do YouTube para formato embed
   */
  static convertYouTubeUrl(url: string): string {
    try {
      // Padrões de URL do YouTube
      const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return `https://www.youtube.com/embed/${match[1]}`;
        }
      }

      // Se já está no formato embed ou não é YouTube, retorna como está
      return url;
    } catch (error) {
      console.error('VideoService: Erro ao converter URL do YouTube:', error);
      return url;
    }
  }

  /**
   * Processa URL/código da Atomicat para formato embed
   */
  static processAtomicatUrl(input: string): string {
    try {
      console.log('VideoService: Processando input da Atomicat:', input);
      
      // Se o input contém HTML (iframe, video, ou video-js), manter como HTML para renderização
      if (this.isAtomicatHtml(input)) {
        console.log('VideoService: Detectado HTML da Atomicat, processando configurações');
        return this.processAtomicatHtmlEmbed(input);
      }

      // Se o input contém HTML (iframe), extrair o src
      if (input.includes('<iframe') || input.includes('<video')) {
        const srcMatch = input.match(/src=['"](.*?)['"]/i);
        if (srcMatch && srcMatch[1]) {
          console.log('VideoService: URL extraída do iframe:', srcMatch[1]);
          return srcMatch[1];
        }
      }

      // Se já é um embed da Atomicat, retorna como está
      if (this.isAtomicatEmbed(input)) {
        return input;
      }

      // Se é uma URL da Atomicat mas não embed, tenta converter
      if (this.isAtomicatUrl(input)) {
        return input;
      }

      // Se não reconhece o formato, retorna como está
      return input;
    } catch (error) {
      console.error('VideoService: Erro ao processar input da Atomicat:', error);
      return input;
    }
  }

  /**
   * Processa HTML embed da Atomicat para garantir configurações adequadas
   */
  static processAtomicatHtmlEmbed(htmlContent: string): string {
    try {
      let processedHtml = htmlContent;

      // Garantir que video-js players tenham configurações adequadas para autoplay
      if (processedHtml.includes('<video-js')) {
        // Adicionar atributos necessários se não existirem
        if (!processedHtml.includes('preload=')) {
          processedHtml = processedHtml.replace('<video-js', '<video-js preload="auto"');
        }
        
        // Garantir que tenha controles básicos
        if (!processedHtml.includes('controls=')) {
          processedHtml = processedHtml.replace('<video-js', '<video-js controls="true"');
        }
      }

      // Para iframes da Atomicat, garantir atributos necessários
      if (processedHtml.includes('<iframe')) {
        // Adicionar allow se não existir
        if (!processedHtml.includes('allow=')) {
          processedHtml = processedHtml.replace(
            '<iframe',
            '<iframe allow="autoplay; encrypted-media; picture-in-picture; fullscreen"'
          );
        }
      }

      console.log('VideoService: HTML da Atomicat processado para melhor compatibilidade');
      return processedHtml;
    } catch (error) {
      console.error('VideoService: Erro ao processar HTML da Atomicat:', error);
      return htmlContent;
    }
  }

  /**
   * Verifica se é URL da Atomicat
   */
  static isAtomicatUrl(url: string): boolean {
    const atomicatPatterns = [
      /(?:https?:\/\/)?(?:www\.)?atomicat\.com\.br/,
      /(?:https?:\/\/)?.*\.atomicat\.com\.br/,
      /(?:https?:\/\/)?(?:www\.)?atomicat\.io/,
      /(?:https?:\/\/)?.*\.atomicat\.io/,
      /(?:https?:\/\/)?media\.atomicat\.pages\.dev/,
      /(?:https?:\/\/)?.*\.atomicat\.pages\.dev/
    ];

    return atomicatPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Verifica se é embed da Atomicat
   */
  static isAtomicatEmbed(url: string): boolean {
    return this.isAtomicatUrl(url) && (
      url.includes('iframe') || 
      url.includes('embed') ||
      url.includes('player') ||
      url.includes('/v1/')
    );
  }

  /**
   * Verifica se é código HTML da Atomicat (incluindo video-js)
   */
  static isAtomicatHtml(input: string): boolean {
    const hasHtmlTags = input.includes('<iframe') || 
                       input.includes('<video') || 
                       input.includes('<video-js') ||
                       input.includes('<script');
    
    const hasAtomicatReference = input.includes('atomicat') || 
                                input.includes('media.atomicat.pages.dev') ||
                                input.includes('vjs-') || // Video.js específico
                                input.includes('video-js'); // Video.js tag
    
    const result = hasHtmlTags && hasAtomicatReference;
    
    if (result) {
      console.log('VideoService: HTML da Atomicat detectado - Tags:', hasHtmlTags, 'Referências:', hasAtomicatReference);
    }
    
    return result;
  }

  /**
   * Determina o tipo de vídeo baseado na URL ou código
   */
  static determineVideoType(input: string): 'youtube' | 'upload' | 'atomicat' {
    // Verificar se é código HTML da Atomicat primeiro
    if (this.isAtomicatHtml(input)) {
      console.log('VideoService: Tipo detectado: atomicat (HTML)');
      return 'atomicat';
    }

    if (VideoUploadService.isSupabaseStorageUrl(input)) {
      return 'upload';
    }
    
    if (this.isAtomicatUrl(input)) {
      console.log('VideoService: Tipo detectado: atomicat (URL)');
      return 'atomicat';
    }
    
    // Verificar se é URL do YouTube
    const youtubePatterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be/
    ];
    
    for (const pattern of youtubePatterns) {
      if (pattern.test(input)) {
        return 'youtube';
      }
    }
    
    // Por padrão, assumir que é upload se não for YouTube nem Atomicat
    return 'upload';
  }

  /**
   * Processa URL do vídeo baseado no tipo
   */
  static processVideoUrl(input: string, type?: 'youtube' | 'upload' | 'atomicat'): string {
    const videoType = type || this.determineVideoType(input);
    
    if (videoType === 'youtube') {
      return this.convertYouTubeUrl(input);
    }
    
    if (videoType === 'atomicat') {
      return this.processAtomicatUrl(input);
    }
    
    // Para vídeos do storage, retornar URL como está
    return input;
  }

  /**
   * Gera URL do vídeo com parâmetros de controle baseados nas configurações
   */
  static generateVideoUrlWithControls(baseUrl: string, controls?: VideoControls): string {
    try {
      const videoType = this.determineVideoType(baseUrl);
      
      // Para vídeos do YouTube, aplicar controles via parâmetros
      if (videoType === 'youtube') {
        // Se não há controles específicos, retorna URL original
        if (!controls) {
          return this.convertYouTubeUrl(baseUrl);
        }

        // Converte para formato embed primeiro
        const embedUrl = this.convertYouTubeUrl(baseUrl);
        
        // Constrói parâmetros baseados nos controles
        const params = new URLSearchParams();
        
        // Controles de interface
        params.set('controls', controls.showControls ? '1' : '0');
        params.set('modestbranding', '1'); // Remove logo do YouTube
        params.set('rel', '0'); // Remove vídeos relacionados
        
        // Controles de interação
        if (!controls.allowKeyboardControls) {
          params.set('disablekb', '1');
        }
        
        if (!controls.allowFullscreen) {
          params.set('fs', '0');
        }
        
        // Controles de reprodução
        if (controls.autoplay) {
          params.set('autoplay', '1');
        }
        
        if (controls.muted) {
          params.set('mute', '1');
        }

        // Adiciona parâmetros à URL
        const separator = embedUrl.includes('?') ? '&' : '?';
        return `${embedUrl}${separator}${params.toString()}`;
      }

      // Para vídeos da Atomicat, processar HTML adequadamente
      if (videoType === 'atomicat') {
        // Se é HTML, processar e retornar o HTML processado
        if (this.isAtomicatHtml(baseUrl)) {
          return this.processAtomicatUrl(baseUrl);
        }
        
        // Se é URL, aplicar parâmetros básicos se necessário
        const processedUrl = this.processAtomicatUrl(baseUrl);
        
        if (!controls) {
          return processedUrl;
        }

        // Adicionar parâmetros básicos se a URL da Atomicat suportar
        const params = new URLSearchParams();
        
        if (controls.autoplay) {
          params.set('autoplay', '1');
        }
        
        if (controls.muted) {
          params.set('muted', '1');
        }

        if (params.toString()) {
          const separator = processedUrl.includes('?') ? '&' : '?';
          return `${processedUrl}${separator}${params.toString()}`;
        }
        
        return processedUrl;
      }
      
      // Para vídeos do storage, retornar URL original (controles serão aplicados no player HTML5)
      return baseUrl;
    } catch (error) {
      console.error('VideoService: Erro ao gerar URL com controles:', error);
      return this.processVideoUrl(baseUrl);
    }
  }
}
