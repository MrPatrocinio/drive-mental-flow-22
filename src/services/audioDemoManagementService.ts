
/**
 * Audio Demo Management Service
 * Responsabilidade: Gerenciar lógica de negócio para áudios de demonstração
 * Princípio SRP: Apenas operações relacionadas a demo de áudios
 * Princípio SSOT: Fonte única de verdade para operações de demo
 * CORRIGIDO: Usa diretamente a coluna is_demo da tabela audios
 */

import { AudioService, Audio } from './supabase/audioService';
import { DataSyncService } from './dataSync';

export class AudioDemoManagementService {
  /**
   * Define um áudio como demonstração
   */
  static async setAsDemo(audioId: string): Promise<void> {
    console.log('AudioDemoManagementService: Definindo áudio como demo:', audioId);
    
    await AudioService.update(audioId, {
      is_demo: true
    });
    
    // Notificar mudanças
    DataSyncService.forceNotification('audios_changed');
    console.log('AudioDemoManagementService: Áudio definido como demo com sucesso');
  }

  /**
   * Remove um áudio da demonstração
   */
  static async removeFromDemo(audioId: string): Promise<void> {
    console.log('AudioDemoManagementService: Removendo áudio da demo:', audioId);
    
    await AudioService.update(audioId, {
      is_demo: false
    });
    
    // Notificar mudanças
    DataSyncService.forceNotification('audios_changed');
    console.log('AudioDemoManagementService: Áudio removido da demo com sucesso');
  }

  /**
   * Obtém o áudio atual de demonstração
   */
  static async getCurrentDemoAudio(): Promise<Audio | null> {
    console.log('AudioDemoManagementService: Buscando áudio demo atual');
    
    // Usar o método getDemoAudio do AudioService que já implementa a busca por is_demo
    const demoAudio = await AudioService.getDemoAudio();
    
    console.log('AudioDemoManagementService: Áudio demo encontrado:', demoAudio?.title || 'Nenhum');
    return demoAudio;
  }

  /**
   * Verifica se um áudio é de demonstração
   */
  static async isDemoAudio(audioId: string): Promise<boolean> {
    const audio = await AudioService.getById(audioId);
    return audio?.is_demo || false;
  }
}
