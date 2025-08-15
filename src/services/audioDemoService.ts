
/**
 * Serviço para verificar se um áudio é de demonstração
 * Princípio SRP: Responsabilidade única - identificar áudios demo
 * Princípio SSOT: Fonte única de verdade para lógica de demo
 */
export class AudioDemoService {
  private static demoAudioId: string | null = null;
  private static lastCheck = 0;
  private static cacheTime = 60000; // 1 minuto de cache

  /**
   * Verifica se um áudio é o áudio de demonstração configurado
   */
  static async isDemoAudio(audioId: string): Promise<boolean> {
    try {
      // Cache simples para evitar consultas excessivas
      const now = Date.now();
      if (now - this.lastCheck > this.cacheTime) {
        await this.refreshDemoAudioId();
        this.lastCheck = now;
      }

      return this.demoAudioId === audioId;
    } catch (error) {
      console.error('AudioDemoService: Erro ao verificar áudio demo:', error);
      return false;
    }
  }

  /**
   * Atualiza o ID do áudio de demonstração do cache
   */
  private static async refreshDemoAudioId(): Promise<void> {
    try {
      const { DemoService } = await import('@/services/supabase/demoService');
      const config = await DemoService.getDemoConfig();
      this.demoAudioId = config.demo_audio_id;
    } catch (error) {
      console.error('AudioDemoService: Erro ao buscar configuração demo:', error);
      this.demoAudioId = null;
    }
  }

  /**
   * Limpa o cache forçando nova consulta
   */
  static clearCache(): void {
    this.lastCheck = 0;
    this.demoAudioId = null;
  }
}
