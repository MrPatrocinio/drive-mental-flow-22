/**
 * VideoService - Gerenciamento de vídeos da landing page
 * Responsabilidade: CRUD de vídeos e controle do vídeo ativo
 * Princípio SRP: Apenas operações relacionadas a vídeos
 * Princípio SSOT: Fonte única da verdade para vídeos
 */

import { supabase } from '@/integrations/supabase/client';

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
  created_at: string;
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

      console.log('VideoService: Vídeos carregados com sucesso');
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
      if (!videoSection.active_video_id) return null;

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
   * Adiciona um novo vídeo
   */
  static async addVideo(videoData: Omit<Video, 'id' | 'created_at'>): Promise<void> {
    try {
      console.log('VideoService: Adicionando novo vídeo');
      const currentData = await this.getVideos();
      
      const newVideo: Video = {
        id: `video_${Date.now()}`,
        ...videoData,
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
   * Remove um vídeo
   */
  static async deleteVideo(videoId: string): Promise<void> {
    try {
      console.log('VideoService: Removendo vídeo');
      const currentData = await this.getVideos();
      
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
}