/**
 * VideoControlsValidationService - Validações inteligentes para controles de vídeo
 * Responsabilidade: Lógica de validação e auto-correção de configurações
 * Princípio SRP: Apenas validações de controles de vídeo
 * Princípio DRY: Reutilizável para qualquer contexto de validação de vídeo
 */

import { VideoControls } from '@/services/supabase/videoService';

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  corrections: VideoControls;
}

export interface ValidationWarning {
  type: 'critical' | 'warning' | 'info';
  message: string;
  affectedControls: (keyof VideoControls)[];
  autoCorrect?: boolean;
}

export class VideoControlsValidationService {
  /**
   * Valida e corrige automaticamente configurações problemáticas
   */
  static validateAndCorrect(controls: VideoControls): ValidationResult {
    const warnings: ValidationWarning[] = [];
    let corrections = { ...controls };

    // Validação 1: Autoplay + Muted (política dos navegadores)
    if (controls.autoplay && !controls.muted) {
      warnings.push({
        type: 'critical',
        message: 'Navegadores modernos exigem que vídeos com autoplay iniciem mutados. Auto-corrigindo...',
        affectedControls: ['autoplay', 'muted'],
        autoCorrect: true
      });
      corrections.muted = true;
    }

    // Validação 2: Muted sem controle de volume
    if (controls.muted && !controls.allowVolumeControl) {
      warnings.push({
        type: 'critical',
        message: 'Vídeo inicia mutado mas usuário não pode desmutar. Ativando controle de volume...',
        affectedControls: ['muted', 'allowVolumeControl'],
        autoCorrect: true
      });
      corrections.allowVolumeControl = true;
    }

    // Validação 3: Sem controles visíveis mas com autoplay
    if (controls.autoplay && !controls.showControls && !controls.allowVolumeControl) {
      warnings.push({
        type: 'warning',
        message: 'Autoplay ativo sem controles pode frustrar usuários. Considere permitir controle de volume.',
        affectedControls: ['autoplay', 'showControls', 'allowVolumeControl']
      });
    }

    // Validação 4: Nenhum controle disponível
    const hasAnyControl = controls.allowPause || controls.allowVolumeControl || 
                         controls.allowSeek || controls.allowFullscreen || 
                         controls.allowKeyboardControls || controls.showControls;
    
    if (!hasAnyControl) {
      warnings.push({
        type: 'warning',
        message: 'Nenhum controle disponível. Usuários terão experiência muito limitada.',
        affectedControls: ['showControls', 'allowVolumeControl']
      });
    }

    // Validação 5: Autoplay sem mute pode não funcionar
    if (controls.autoplay && !controls.muted) {
      warnings.push({
        type: 'info',
        message: 'Autoplay sem mute pode ser bloqueado pelos navegadores.',
        affectedControls: ['autoplay', 'muted']
      });
    }

    return {
      isValid: warnings.filter(w => w.type === 'critical').length === 0,
      warnings,
      corrections
    };
  }

  /**
   * Retorna presets de configuração predefinidos
   */
  static getPresets(): Record<string, { name: string; description: string; controls: VideoControls }> {
    return {
      interactive: {
        name: 'Vídeo Interativo',
        description: 'Todos os controles habilitados para máxima interação',
        controls: {
          allowPause: true,
          allowVolumeControl: true,
          allowSeek: true,
          allowFullscreen: true,
          allowKeyboardControls: true,
          showControls: true,
          autoplay: false,
          muted: false
        }
      },
      presentation: {
        name: 'Apresentação Profissional',
        description: 'Autoplay com controle de volume (recomendado)',
        controls: {
          allowPause: false,
          allowVolumeControl: true,
          allowSeek: false,
          allowFullscreen: true,
          allowKeyboardControls: false,
          showControls: false,
          autoplay: true,
          muted: true
        }
      },
      restricted: {
        name: 'Reprodução Restrita',
        description: 'Apenas volume para garantir áudio',
        controls: {
          allowPause: false,
          allowVolumeControl: true,
          allowSeek: false,
          allowFullscreen: false,
          allowKeyboardControls: false,
          showControls: false,
          autoplay: false,
          muted: false
        }
      },
      minimal: {
        name: 'Reprodução Mínima',
        description: 'Autoplay sem nenhum controle',
        controls: {
          allowPause: false,
          allowVolumeControl: false,
          allowSeek: false,
          allowFullscreen: false,
          allowKeyboardControls: false,
          showControls: false,
          autoplay: true,
          muted: true
        }
      }
    };
  }

  /**
   * Aplica auto-correção para um controle específico
   */
  static applySmartCorrection(controls: VideoControls, changedKey: keyof VideoControls, newValue: boolean): VideoControls {
    let corrected = { ...controls, [changedKey]: newValue };

    switch (changedKey) {
      case 'autoplay':
        if (newValue) {
          // Se ativou autoplay, deve mutar
          corrected.muted = true;
        }
        break;

      case 'muted':
        if (newValue && !corrected.allowVolumeControl) {
          // Se mutou sem controle de volume, ativa controle
          corrected.allowVolumeControl = true;
        }
        break;

      case 'allowVolumeControl':
        if (!newValue && corrected.muted) {
          // Se desativou volume mas está mutado, desmuta
          corrected.muted = false;
        }
        break;

      case 'showControls':
        if (!newValue && corrected.autoplay && !corrected.allowVolumeControl) {
          // Se ocultou controles com autoplay, garante controle de volume
          corrected.allowVolumeControl = true;
        }
        break;
    }

    return corrected;
  }
}