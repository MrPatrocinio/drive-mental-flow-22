
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Field as EditableField, FieldService } from '@/services/supabase/fieldService';
import { Audio as EditableAudio, AudioService } from '@/services/supabase/audioService';
import { landingContentService, LandingPageContent } from '@/services/landingContentService';
import { PricingService, PricingInfo, PricingInsert } from '@/services/supabase/pricingService';
import { useDataSync } from '@/hooks/useDataSync';
import { syncDiagnostics } from '@/services/syncDiagnostics';
import type { AuthUser } from '@/services/supabase/authService';

interface AdminContextType {
  // Auth state
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  
  // Content state
  landingContent: LandingPageContent;
  fields: EditableField[];
  audios: EditableAudio[];
  pricing: PricingInfo | null;
  
  // Content actions
  updateLandingContent: (content: LandingPageContent) => Promise<void>;
  updateField: (field: EditableField) => Promise<void>;
  deleteField: (fieldId: string) => Promise<void>;
  updateAudio: (audio: EditableAudio) => Promise<void>;
  deleteAudio: (audioId: string) => Promise<void>;
  updatePricing: (pricing: PricingInsert) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, signOut } = useSupabaseAuth();
  
  // Content state - usar o serviço unificado
  const [landingContent, setLandingContent] = useState<LandingPageContent>(() => {
    return {
      hero: {
        title: "Transforme sua mente e conquiste",
        titleHighlight: "seus objetivos mais ambiciosos",
        subtitle: "Desbloqueie todo o seu potencial com áudios de programação mental cientificamente desenvolvidos.",
        ctaText: "Começar Agora",
        demoText: "Ver Demo"
      },
      features: [
        {
          id: "feature-1",
          icon: "Brain",
          title: "Programação Mental Avançada",
          description: "Áudios desenvolvidos com técnicas neurocientíficas"
        }
      ],
      footer: {
        copyright: "© 2024 Drive Mental. Todos os direitos reservados.",
        lgpdText: "Este site está em conformidade com a LGPD",
        lgpdLink: "/lgpd",
        privacyPolicyLink: "/privacy",
        termsOfServiceLink: "/terms"
      }
    };
  });
  const [fields, setFields] = useState<EditableField[]>([]);
  const [audios, setAudios] = useState<EditableAudio[]>([]);
  const [pricing, setPricing] = useState<PricingInfo | null>(null);

  // Setup data sync
  useDataSync({
    onFieldsChange: () => {
      syncDiagnostics.log('admin_fields_change_notification', 'success');
      refreshData();
    },
    onAudiosChange: () => {
      syncDiagnostics.log('admin_audios_change_notification', 'success');
      refreshData();
    },
    onContentChange: () => {
      syncDiagnostics.log('admin_content_change_notification', 'success');
      refreshData();
    }
  });

  const logout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
      throw new Error(error);
    }
  };

  // Content actions com melhor sincronização
  const updateLandingContent = async (content: LandingPageContent) => {
    syncDiagnostics.log('admin_saving_landing_content', 'success', content);
    
    try {
      // Salvar no serviço unificado (que já gerencia cache e logs)
      await landingContentService.saveLandingPageContent(content);
      
      // Atualizar estado local
      setLandingContent(content);
      
      syncDiagnostics.log('admin_landing_content_saved', 'success');

      // Aguardar um pouco antes de forçar notificação (dar tempo para o realtime processar)
      setTimeout(() => {
        import('@/services/dataSync').then(({ DataSyncService }) => {
          DataSyncService.forceNotification('content_changed');
        });
      }, 100);

    } catch (error) {
      syncDiagnostics.log('admin_landing_content_save_error', 'error', error);
      throw error;
    }
  };

  const updateField = async (field: EditableField) => {
    syncDiagnostics.log('admin_saving_field', 'success', field);
    try {
      if (field.id) {
        await FieldService.update(field.id, {
          title: field.title,
          icon_name: field.icon_name,
          description: field.description || ''
        });
      }
      await refreshData();
      
      setTimeout(() => {
        import('@/services/dataSync').then(({ DataSyncService }) => {
          DataSyncService.forceNotification('fields_changed');
        });
      }, 100);
      
    } catch (error) {
      syncDiagnostics.log('admin_field_save_error', 'error', error);
      throw error;
    }
  };

  const deleteField = async (fieldId: string) => {
    syncDiagnostics.log('admin_deleting_field', 'success', fieldId);
    try {
      await FieldService.delete(fieldId);
      await refreshData();
      
      setTimeout(() => {
        import('@/services/dataSync').then(({ DataSyncService }) => {
          DataSyncService.forceNotification('fields_changed');
        });
      }, 100);
      
    } catch (error) {
      syncDiagnostics.log('admin_field_delete_error', 'error', error);
      throw error;
    }
  };

  const updateAudio = async (audio: EditableAudio) => {
    syncDiagnostics.log('admin_saving_audio', 'success', audio);
    try {
      if (audio.id) {
        await AudioService.update(audio.id, {
          title: audio.title,
          field_id: audio.field_id,
          duration: audio.duration,
          tags: audio.tags || [],
          url: audio.url
        });
      }
      await refreshData();
      
      setTimeout(() => {
        import('@/services/dataSync').then(({ DataSyncService }) => {
          DataSyncService.forceNotification('audios_changed');
        });
      }, 100);
      
    } catch (error) {
      syncDiagnostics.log('admin_audio_save_error', 'error', error);
      throw error;
    }
  };

  const deleteAudio = async (audioId: string) => {
    syncDiagnostics.log('admin_deleting_audio', 'success', audioId);
    try {
      await AudioService.delete(audioId);
      await refreshData();
      
      setTimeout(() => {
        import('@/services/dataSync').then(({ DataSyncService }) => {
          DataSyncService.forceNotification('audios_changed');
        });
      }, 100);
      
    } catch (error) {
      syncDiagnostics.log('admin_audio_delete_error', 'error', error);
      throw error;
    }
  };

  const updatePricing = async (pricingData: PricingInsert) => {
    syncDiagnostics.log('admin_saving_pricing', 'success', pricingData);
    try {
      const savedPricing = await PricingService.save(pricingData);
      setPricing(savedPricing);
      
      setTimeout(() => {
        import('@/services/dataSync').then(({ DataSyncService }) => {
          DataSyncService.forceNotification('content_changed');
        });
      }, 100);
      
    } catch (error) {
      syncDiagnostics.log('admin_pricing_save_error', 'error', error);
      throw error;
    }
  };

  const refreshData = async () => {
    syncDiagnostics.log('admin_refreshing_all_data', 'success');
    try {
      const [landingContentData, fieldsData, audiosData, pricingData] = await Promise.all([
        landingContentService.getLandingPageContent(true), // Force refresh
        FieldService.getAll(),
        AudioService.getAll(),
        PricingService.get()
      ]);

      setLandingContent(landingContentData);
      setFields(fieldsData);
      setAudios(audiosData);
      setPricing(pricingData);

      syncDiagnostics.log('admin_data_refreshed_successfully', 'success');
    } catch (error) {
      syncDiagnostics.log('admin_data_refresh_error', 'error', error);
    }
  };

  // Initial data load
  useEffect(() => {
    if (user?.role === 'admin') {
      refreshData();
    }
  }, [user]);

  const value: AdminContextType = {
    user,
    isAuthenticated: isAuthenticated && user?.role === 'admin',
    isLoading,
    logout,
    landingContent,
    fields,
    audios,
    pricing,
    updateLandingContent,
    updateField,
    deleteField,
    updateAudio,
    deleteAudio,
    updatePricing,
    refreshData,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
