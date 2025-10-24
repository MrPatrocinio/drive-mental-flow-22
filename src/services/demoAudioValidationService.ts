
/**
 * DemoAudioValidationService - Serviço para validação de áudio demo
 * Responsabilidade: Única - validar integridade do áudio de demonstração
 * Princípio SRP: Apenas validação de áudio demo
 * Princípio KISS: Validação simples e direta
 */

import { Audio, AudioService } from './supabase/audioService';

export interface DemoAudioValidationResult {
  isValid: boolean;
  audio?: Audio;
  error?: string;
}

export class DemoAudioValidationService {
  /**
   * Valida se o áudio demo atual é válido
   */
  static async validateCurrentDemoAudio(): Promise<DemoAudioValidationResult> {
    try {
      console.log('DemoAudioValidationService: Validando áudio demo atual');
      
      const demoAudio = await AudioService.getDemoAudio();
      
      if (!demoAudio) {
        return {
          isValid: false,
          error: 'Nenhum áudio demo configurado'
        };
      }

      // Validar se URL não está vazia
      if (!demoAudio.url || demoAudio.url.trim() === '') {
        console.error('DemoAudioValidationService: URL do áudio demo está vazia');
        return {
          isValid: false,
          error: 'Áudio demo sem URL válida'
        };
      }

      // Validar se título não está vazio
      if (!demoAudio.title || demoAudio.title.trim() === '') {
        console.error('DemoAudioValidationService: Título do áudio demo está vazio');
        return {
          isValid: false,
          error: 'Áudio demo sem título válido'
        };
      }

      console.log('DemoAudioValidationService: Áudio demo válido:', demoAudio.title);
      return {
        isValid: true,
        audio: demoAudio
      };
    } catch (error) {
      console.error('DemoAudioValidationService: Erro ao validar áudio demo:', error);
      return {
        isValid: false,
        error: 'Erro ao validar áudio demo'
      };
    }
  }

  /**
   * Busca um áudio demo alternativo válido
   */
  static async findValidDemoAlternative(): Promise<Audio | null> {
    try {
      console.log('DemoAudioValidationService: Buscando alternativa válida para demo');
      
      const allAudios = await AudioService.getAll();
      
      // Buscar áudios com URL válida
      const validAudios = allAudios.filter(audio => 
        audio.url && 
        audio.url.trim() !== '' && 
        audio.title && 
        audio.title.trim() !== ''
      );

      if (validAudios.length === 0) {
        console.log('DemoAudioValidationService: Nenhuma alternativa válida encontrada');
        return null;
      }

      // Retornar o primeiro áudio válido
      const alternative = validAudios[0];
      console.log('DemoAudioValidationService: Alternativa encontrada:', alternative.title);
      return alternative;
    } catch (error) {
      console.error('DemoAudioValidationService: Erro ao buscar alternativa:', error);
      return null;
    }
  }
}
