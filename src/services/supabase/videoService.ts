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

      console.log('VideoService: Dados carregados:', JSON.stringify(videoData, null, 2));

      // Auto-ativar primeiro vídeo se nenhum estiver ativo e houver vídeos disponíveis
      if (!videoData.active_video_id && videoData.videos.length > 0) {
        console.log('VideoService: Nenhum vídeo ativo encontrado, ativando o primeiro automaticamente');
        const firstVideoId = videoData.videos[0].id;
        await this.setActiveVideo(firstVideoId);
        videoData.active_video_id = firstVideoId;
        console.log('VideoService: Primeiro vídeo ativado automaticamente:', firstVideoId);
      }

      console.log('VideoService: Vídeos carregados com sucesso. Vídeo ativo:', videoData.active_video_id);
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
      console.log('VideoService: Buscando vídeo ativo');
      const videoSection = await this.getVideos();
      
      console.log('VideoService: ID do vídeo ativo:', videoSection.active_video_id);
      console.log('VideoService: Total de vídeos disponíveis:', videoSection.videos.length);
      
      if (!videoSection.active_video_id) {
        console.log('VideoService: Nenhum vídeo ativo definido');
        return null;
      }

      const activeVideo = videoSection.videos.find(
        video => video.id === videoSection.active_video_id
      );

      if (activeVideo) {
        console.log('VideoService: Vídeo ativo encontrado:', activeVideo.title);
        console.log('VideoService: URL do vídeo:', activeVideo.url);
      } else {
        console.warn('VideoService: Vídeo ativo não encontrado na lista de vídeos');
      }

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